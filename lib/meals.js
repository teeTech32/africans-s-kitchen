"use server"

import sql from 'better-sqlite3'
import slugify from 'slugify'
import xss from 'xss'
import { DeleteObjectCommand, S3, PutObjectCommand } from '@aws-sdk/client-s3'

const s3 = new S3({
  region: process.env.AWS_REGION,
  credentials:{
    accessKeyId : process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey : process.env.AWS_SECRET_ACCESS_KEY,
  },
})

const db = sql('meals.db')

export async function getMeals(){
  //I could as well remove the promising function so that I can fetch from the database faster, but I wanted to show the possibilities in Next.js and how elegant I could handle loading data or resource dely in the client-side (the browser) 
  if(process.env.NODE_ENV !== 'production'){
await new Promise((resolve)=>setTimeout(resolve, 3000))
  }
  const meals = db.prepare('SELECT * FROM meals').all()
  return meals
}

export async function getMeal(slug){
   const meal = db.prepare('SELECT * FROM meals WHERE slug = ?').get(slug);
   return meal
}

export async function createMeal(meal){
  try{
    //I use slugify here for generating slug and turning it into lowercase value for each meal formData so that it could tally with keys I have in the databse table.
  meal.slug = slugify(meal.title, {lower:true});
  //If you observed vividly, you will discover that I used a method called dangerouslySetInnerHTML() to render the insructions value on the client-side so that I could use Regular Expression on it for always proper arrangement of instructions input from users which made the application vulnerable to cross-site scripting attackers. In other to prevent this, I employed xss.
  meal.instructions = xss(meal.instructions);
  // I needed to create a special fileName for each image that comes in and store in file system ('/public/images/fileName')
  const extension = meal.image.name.split('.').pop();
  const fileName = `${meal.slug}.${extension}`
  const bufferedImage = await meal.image.arrayBuffer();
  // in other to write and work with AWS s3 Bucket, I used (putObject, from AWS s3)
  await s3.putObject({
  Bucket: process.env.AWS_S3_BUCKET,
  Key: fileName,
  Body: Buffer.from(bufferedImage),
  ContentType: meal.image.type
  }) 
  // I needed to declear the name of image save in the database for each image that comes in from users.
  meal.image = `${fileName}`
  //I checked if the slug name already exist in the table against clashing of image name while viewing meal.
  const slugexist = db.prepare('SELECT * FROM meals WHERE slug = ?').get(meal.slug);
  // now I could save data into the database
  if(!slugexist){
    db.prepare(`
      INSERT INTO meals
      (title, creator, creator_email, summary, instructions, image, slug)
      VALUES(
      @title,
      @creator,
      @creator_email,
      @summary,
      @instructions,
      @image,
      @slug
      )
      `).run(meal)
  } 
  return {success: true}

  }catch(error){
    return {
      success: false,
      error: 'CREATE_MEAL_FAILED',
      message: error.message || 'Something went wrong while creating the meal.',
    };
  }
}

export async function deleteMeal(id){
  try{
    const meal = db.prepare('SELECT * FROM meals WHERE id = ?').get(id);
  //I could as well remove the promising function so that I can delete from the database faster, but I wanted to show the possibilities in Next.js and how elegant I could handle deleting data or resource dely in the client-side (the browser) 
  if(process.env.NODE_ENV !== 'production'){
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  if(meal){
    const imageKey = meal.image 
    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: imageKey
      })
    );
    db.prepare('DELETE FROM meals WHERE id = ?').run(meal.id); 
    return {success: true}
  }else {
    return {
      success: false,
      error: 'MEAL_NOT_FOUND',
      message: 'The meal does not exist.'
    };
  }
  }catch(error){
    return {
      success: false,
      error: 'DELETE_MEAL_FAILED',
      message: error.message || 'Something went wrong while deleting the meal!.'
    }
  } 
}

export async function editMeal(formData){
  try{
    const id = formData.get('id');
    const creator = formData.get('creator');
    const creator_email = formData.get('creator_email');
    const title = formData.get('title');
    const summary = formData.get('summary');
    const instructions = formData.get('instructions');
    const image = formData.get('image');
  
    const meal = db.prepare(`SELECT * FROM meals WHERE id = ?`).get(id);
    if(process.env.NODE_ENV !== 'production'){
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    if(!meal){
      throw new Error("The Chosen Meal dosen't exist!")
    }
    let finalImage = image
    // Upload new Image to s3 if exist.
    if(image && typeof image !== 'string' && image.size > 0){
      const imageBuffer = Buffer.from(await image.arrayBuffer());
      const newKey = `${Date.now()}-${image.name}`
  
      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET,
          Body: imageBuffer,
          Key: newKey,
          ContentType: image.type,
        })
      )
  
     // Delete old image if present
     const oldkey = meal.image
      if(oldkey){
        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: oldkey
          })
        )
      }
      finalImage = newKey
      db.prepare(`UPDATE meals SET creator = ?, creator_email = ?, title = ?, summary = ?, instructions = ?, image = ? WHERE id = ? `).run(creator, creator_email, title, summary, instructions, finalImage, id)
    }else{
      const mealImage = meal.image;
      db.prepare(`UPDATE meals SET creator = ?, creator_email = ?, title = ?, summary = ?, instructions = ?, image = ? WHERE id = ? `).run(creator, creator_email, title, summary, instructions, mealImage, id)
    }
    return {success: true}
  }catch(error){
    return{
      success: false,
      error: 'UPDATED MEAL FAILED',
      message: error.message || 'Something went wrong, check your internet connections'
    }
  }
}

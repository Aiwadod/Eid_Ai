import type { NextApiRequest, NextApiResponse } from 'next';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { userName, isClubMember } = req.body;

  if (!userName || typeof isClubMember === 'undefined') {
    return res.status(400).json({ message: 'Missing parameters' });
  }

  try {
    console.log('Starting card generation for:', { userName, isClubMember });

    const imageDir = isClubMember ? 'ai' : 'others';
    const directoryPath = path.join(process.cwd(), 'public', imageDir);
    console.log('Looking for images in:', directoryPath);

    // Get list of image files in the directory
    let files;
    try {
      files = await fs.readdir(directoryPath);
      console.log('Found files:', files);
    } catch (error) {
      console.error('Error reading directory:', error);
      return res.status(500).json({ message: 'Error reading image directory' });
    }

    const imageFiles = files.filter(file => {
      const lowerCaseFile = file.toLowerCase();
      return lowerCaseFile.endsWith('.jpg') || lowerCaseFile.endsWith('.jpeg') || lowerCaseFile.endsWith('.png');
    });

    if (imageFiles.length === 0) {
      console.error('No image files found in directory:', imageDir);
      return res.status(404).json({ message: `No image files found in ${imageDir} directory.` });
    }

    // Select a random image file
    const randomImageName = imageFiles[Math.floor(Math.random() * imageFiles.length)];
    const imagePath = path.join(directoryPath, randomImageName);
    console.log('Selected image:', imagePath);

    // Check if the image file exists
    try {
      await fs.access(imagePath);
    } catch (error) {
      console.error('Image file not found:', imagePath, error);
      return res.status(404).json({ message: 'Selected background image not found.' });
    }

    try {
      // Load and process the base image
      const image = sharp(imagePath);
      const metadata = await image.metadata();
      console.log('Image metadata:', metadata);

      if (!metadata.width || !metadata.height) {
        throw new Error('Invalid image metadata: missing width or height');
      }

      // Calculate text position
      const textYPercentage = 15;
      const textY = Math.round((metadata.height * textYPercentage) / 100);

      // Create SVG for text overlay
      const svgText = `
        <svg width="${metadata.width}" height="${metadata.height}">
          <style>
            .text { 
              fill: white; 
              font-size: 60px; 
              font-weight: bold; 
              text-anchor: middle; 
            }
          </style>
          <text x="50%" y="${textY}" class="text">${userName}</text>
        </svg>
      `;

      const svgBuffer = Buffer.from(svgText);

      // Prepare composite layers
      const compositeLayers = [
        {
          input: svgBuffer,
          gravity: 'northwest'
        }
      ];

      // Add logo if the user is a club member
      if (isClubMember) {
        const logoPath = path.join(process.cwd(), 'public', 'bg', 'logo.png');
        try {
          await fs.access(logoPath);
          const logoBuffer = await fs.readFile(logoPath);
          console.log('Logo file found and read successfully');
          
          // Process logo
          const logo = sharp(logoBuffer).resize({ width: 100 });
          const logoMetadata = await logo.metadata();
          
          if (!logoMetadata.width) {
            throw new Error('Invalid logo metadata: missing width');
          }

          const logoX = Math.round((metadata.width - logoMetadata.width) / 2);
          const logoY = 20;

          compositeLayers.push({
            input: await logo.toBuffer(),
            top: logoY,
            left: logoX
          });
          console.log('Logo added to composite layers');

        } catch (logoError) {
          console.error('Logo processing error:', logoError);
          console.log('Continuing without logo overlay');
        }
      }

      console.log('Starting final image composition');
      const finalImageBuffer = await image
        .composite(compositeLayers)
        .png()
        .toBuffer();
      console.log('Image composition completed successfully');

      res.setHeader('Content-Type', 'image/png');
      res.status(200).send(finalImageBuffer);

    } catch (error) {
      console.error('Error processing image:', error);
      return res.status(500).json({ 
        message: 'Error processing image',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
    }

  } catch (error) {
    console.error('Error generating card:', error);
    res.status(500).json({ 
      message: 'Error generating card',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
} 
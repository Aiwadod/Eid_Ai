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
    const imageDir = isClubMember ? 'ai' : 'others';
    const directoryPath = path.join(process.cwd(), 'public', imageDir);

    // Get list of image files in the directory
    const files = await fs.readdir(directoryPath);
    const imageFiles = files.filter(file => {
      const lowerCaseFile = file.toLowerCase();
      return lowerCaseFile.endsWith('.jpg') || lowerCaseFile.endsWith('.jpeg') || lowerCaseFile.endsWith('.png');
    });

    if (imageFiles.length === 0) {
      return res.status(404).json({ message: `No image files found in ${imageDir} directory.` });
    }

    // Select a random image file
    const randomImageName = imageFiles[Math.floor(Math.random() * imageFiles.length)];
    const imagePath = path.join(directoryPath, randomImageName);

    // Check if the image file exists
    try {
      await fs.access(imagePath);
    } catch (error) {
      console.error(`Image file not found: ${imagePath}`, error);
      return res.status(404).json({ message: 'Selected background image not found.' });
    }

    let image = sharp(imagePath);
    const metadata = await image.metadata();

    // Calculate text position
    const textYPercentage = 15;
    const textY = Math.round((metadata.height * textYPercentage) / 100);

    // Create a simple text overlay using sharp's built-in text
    const textOverlay = {
      text: {
        text: userName,
        font: 'sans',
        fontSize: 60,
        rgba: true,
        align: 'center',
        top: textY,
        left: Math.round(metadata.width / 2)
      }
    };

    const compositeLayers: any[] = [textOverlay];

    // Add logo if the user is a club member
    if (isClubMember) {
      const logoPath = path.join(process.cwd(), 'public', 'bg', 'logo.png');
      try {
        await fs.access(logoPath);
        const logoBuffer = await fs.readFile(logoPath);
        
        // Resize logo if needed and calculate position
        const logo = sharp(logoBuffer).resize({ width: 100 });
        const logoMetadata = await logo.metadata();
        
        const logoX = Math.round((metadata.width - logoMetadata.width) / 2);
        const logoY = 20;

        compositeLayers.push({
          input: await logo.toBuffer(),
          top: logoY,
          left: logoX,
        });

      } catch (logoError) {
        console.error('Logo file not found or error processing logo:', logoError);
        console.log('Continuing without logo overlay');
      }
    }

    const finalImageBuffer = await image
      .composite(compositeLayers)
      .png()
      .toBuffer();

    res.setHeader('Content-Type', 'image/png');
    res.status(200).send(finalImageBuffer);

  } catch (error) {
    console.error('Error generating card:', error);
    res.status(500).json({ message: 'Error generating card' });
  }
} 
import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import path from 'path';

interface ExcusedAbsenceData {
  studentName: string;
  schoolName: string;
  presentationDate: string;
  hoursLogged: number;
  activity: string;
  teacherName: string;
  teacherSignature?: string;
  volunteerTeam: string;
  presentationTopic: string;
}

export async function generateExcusedAbsencePDF(data: ExcusedAbsenceData): Promise<Buffer> {
  const canvas = createCanvas(612, 792); // Letter size: 8.5 x 11 inches at 72 DPI
  const ctx = canvas.getContext('2d');

  // Set background to white
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 612, 792);

  // Header
  ctx.fillStyle = '#1F2937';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Green Silicon Valley', 306, 60);

  ctx.font = '16px Arial';
  ctx.fillStyle = '#6B7280';
  ctx.fillText('Volunteer Hours Verification', 306, 85);

  // Draw a line
  ctx.strokeStyle = '#E5E7EB';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(50, 110);
  ctx.lineTo(562, 110);
  ctx.stroke();

  // Student Information Section
  ctx.fillStyle = '#1F2937';
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('Student Information', 50, 140);

  ctx.fillStyle = '#374151';
  ctx.font = '14px Arial';

  const studentInfo = [
    { label: 'Student Name:', value: data.studentName },
    { label: 'School:', value: data.schoolName },
    { label: 'Volunteer Team:', value: data.volunteerTeam }
  ];

  let yPos = 165;
  studentInfo.forEach(info => {
    ctx.fillText(info.label, 50, yPos);
    ctx.fillText(info.value, 200, yPos);
    yPos += 25;
  });

  // Presentation Information Section
  yPos += 20;
  ctx.fillStyle = '#1F2937';
  ctx.font = 'bold 18px Arial';
  ctx.fillText('Presentation Information', 50, yPos);

  yPos += 25;
  ctx.fillStyle = '#374151';
  ctx.font = '14px Arial';

  const presentationInfo = [
    { label: 'Presentation Date:', value: new Date(data.presentationDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })},
    { label: 'Topic:', value: data.presentationTopic },
    { label: 'Activity:', value: data.activity },
    { label: 'Hours Logged:', value: `${data.hoursLogged} hours` }
  ];

  presentationInfo.forEach(info => {
    ctx.fillText(info.label, 50, yPos);
    ctx.fillText(info.value, 200, yPos);
    yPos += 25;
  });

  // Teacher Verification Section
  yPos += 30;
  ctx.fillStyle = '#1F2937';
  ctx.font = 'bold 18px Arial';
  ctx.fillText('Teacher Verification', 50, yPos);

  yPos += 25;
  ctx.fillStyle = '#374151';
  ctx.font = '14px Arial';
  ctx.fillText('Verified By:', 50, yPos);
  ctx.fillText(data.teacherName, 200, yPos);

  // Add signature if provided
  if (data.teacherSignature) {
    yPos += 40;
    ctx.fillText('Teacher Signature:', 50, yPos);

    try {
      // Load and draw signature image
      const signatureImage = await loadImage(data.teacherSignature);
      const signatureWidth = Math.min(200, signatureImage.width);
      const signatureHeight = (signatureImage.height * signatureWidth) / signatureImage.width;

      ctx.drawImage(signatureImage, 200, yPos - 20, signatureWidth, signatureHeight);
      yPos += signatureHeight + 20;
    } catch (error) {
      console.error('Error loading signature image:', error);
      yPos += 40;
    }
  } else {
    yPos += 25;
    ctx.fillStyle = '#DC2626';
    ctx.font = '12px Arial';
    ctx.fillText('Signature pending - Email verification sent to teacher', 50, yPos);
    yPos += 25;
  }

  // Footer
  ctx.strokeStyle = '#E5E7EB';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(50, 700);
  ctx.lineTo(562, 700);
  ctx.stroke();

  ctx.fillStyle = '#6B7280';
  ctx.font = '10px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('This document serves as official verification of volunteer hours completed.', 306, 720);
  ctx.fillText(`Generated on ${new Date().toLocaleDateString('en-US')}`, 306, 735);

  // Add GSV logo placeholder (you would replace this with actual logo)
  ctx.fillStyle = '#10B981';
  ctx.font = 'bold 12px Arial';
  ctx.fillText('Green Silicon Valley', 50, 760);
  ctx.font = '10px Arial';
  ctx.fillStyle = '#6B7280';
  ctx.fillText('Empowering the next generation through STEM education', 50, 775);

  return canvas.toBuffer('application/pdf');
}

export async function generateAndSaveExcusedAbsencePDF(
  data: ExcusedAbsenceData,
  filename?: string
): Promise<string> {
  const pdfBuffer = await generateExcusedAbsencePDF(data);

  // Generate filename if not provided
  const fileName = filename || `excused_absence_${data.studentName.replace(/\s+/g, '_')}_${Date.now()}.pdf`;

  // Save to a temporary location (you might want to use a cloud storage service)
  const tempDir = path.join(process.cwd(), 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const filePath = path.join(tempDir, fileName);
  fs.writeFileSync(filePath, pdfBuffer);

  return filePath;
}

// Alternative implementation using pdfkit if canvas doesn't work well
export async function generateExcusedAbsencePDFAlt(data: ExcusedAbsenceData): Promise<Buffer> {
  // This would use pdfkit instead of canvas for better PDF generation
  // Implementation would be similar but use PDFKit library
  throw new Error('PDFKit implementation not yet available');
}

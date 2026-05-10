import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Firebase config for server-side usage (optional but helpful for admin tasks)
const firebaseConfig = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "firebase-applet-config.json"), "utf8")
);

const firebaseApp = initializeApp(firebaseConfig);
const dbEnterprise = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId || '(default)');
const dbStandard = getFirestore(firebaseApp, '(default)');

// Helper to determine if we have two distinct databases
const hasTwoDbs = firebaseConfig.firestoreDatabaseId && 
                  firebaseConfig.firestoreDatabaseId !== '(default)' && 
                  firebaseConfig.firestoreDatabaseId !== 'undefined';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // SMTP configuration helper
  const getSmtpConfig = () => {
    return {
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT || "465"),
      user: process.env.SMTP_USER || "waifuwall0@gmail.com",
      pass: process.env.SMTP_PASS || "loqs lysz rdna kfwx",
      from: process.env.SMTP_FROM || '"WaifuWall" <waifuwall0@gmail.com>'
    };
  };

  // Helper for SMTP Transporter
  const getTransporter = () => {
    const config = getSmtpConfig();

    return nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
  };

  // API Route: Send Welcome Email
  app.post("/api/send-welcome", async (req, res) => {
    const { email, displayName } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    try {
      const config = getSmtpConfig();
      const transporter = getTransporter();

      await transporter.sendMail({
        from: config.from,
        to: email,
        subject: `Bienvenue sur WaifuWall`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #fdf2f8; margin: 0; padding: 40px 20px; color: #1f2937; }
              .container { background-color: #ffffff; max-width: 600px; margin: 0 auto; padding: 40px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
              .header { text-align: center; margin-bottom: 30px; }
              .header h1 { color: #ec4899; margin: 0; font-size: 28px; }
              .content { line-height: 1.6; font-size: 16px; }
              .btn { display: inline-block; background-color: #ec4899; color: #ffffff; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 8px; margin: 20px 0; }
              .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #f3f4f6; text-align: center; font-size: 12px; color: #9ca3af; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>WaifuWall</h1>
              </div>
              <div class="content">
                <p><strong>Bienvenue sur WaifuWall, ${displayName || 'Utilisateur'} ! 🎉</strong></p>
                <p>Nous sommes ravis de vous compter parmi nous. Votre compte a été créé avec succès.</p>
                
                <p style="text-align:center;">
                  <a href="${req.protocol}://${req.get('host')}" class="btn">Explorer les wallpapers</a>
                </p>
                
                <p>
                  Que pouvez-vous faire sur WaifuWall ?<br/>
                  - Explorez des milliers de fonds d'écran de haute qualité<br/>
                  - Enregistrez vos favoris dans votre collection<br/>
                  - Créez votre profil unique
                </p>

                <p>À très bientôt !<br/>L'équipe WaifuWall</p>
              </div>
              
              <!-- FOOTER -->
              <div class="footer">
                © ${new Date().getFullYear()} WaifuWall — Tous droits réservés<br>
                Cet email vous a été envoyé après votre inscription.
              </div>
            </div>
          </body>
          </html>
        `
      });

      res.json({ success: true, message: "Welcome email sent" });
    } catch (error) {
      console.error("Failed to send welcome email:", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  // API Route: Contact Form
  app.post("/api/contact", async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Tous les champs sont requis." });
    }

    try {
      const config = getSmtpConfig();
      const transporter = getTransporter();

      console.log(`Attempting to send contact email from ${email} to ${config.user}`);

      // Send to the admin
      await transporter.sendMail({
        from: config.from,
        to: config.user, // Send to the admin email configured in SMTP user
        replyTo: email,
        subject: `[Contact] Nouveau message de ${name}`,
        text: `Nom: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        html: `
          <div style="font-family: sans-serif; padding: 30px; border: 1px solid #f0f0f0; border-radius: 16px; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #6366f1; margin: 0;">WaifuWall</h1>
              <p style="color: #64748b; margin-top: 5px;">Nouveau message de contact</p>
            </div>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
              <p style="margin: 0 0 10px 0;"><strong>Expéditeur:</strong> ${name}</p>
              <p style="margin: 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #6366f1;">${email}</a></p>
            </div>
            
            <div style="line-height: 1.6; color: #1e293b;">
              <h4 style="margin-bottom: 10px; border-bottom: 1px solid #f1f5f9; padding-bottom: 5px;">Message:</h4>
              <p style="white-space: pre-wrap;">${message}</p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 12px; color: #94a3b8;">
              Cet email a été envoyé via le formulaire de contact de WaifuWall.
            </div>
          </div>
        `
      });

      res.json({ success: true, message: "Email envoyé avec succès" });
    } catch (error: any) {
      console.error("Erreur d'envoi contact:", error);
      res.status(500).json({ 
        error: "Échec de l'envoi de l'email. Cependant, votre message a été enregistré dans notre base de données.",
        details: error.message 
      });
    }
  });

  // API Route: Admin Broadcast Email
  app.post("/api/admin/broadcast-email", async (req, res) => {
    const { subject, message, adminUid, target = "both" } = req.body;

    if (!subject || !message || !adminUid) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      // Check admin status in either database
      let adminDoc = await getDoc(doc(dbStandard, "users", adminUid));
      let isAdmin = adminDoc.exists() && adminDoc.data().isAdmin;
      
      if (!isAdmin && hasTwoDbs) {
        adminDoc = await getDoc(doc(dbEnterprise, "users", adminUid));
        isAdmin = adminDoc.exists() && adminDoc.data().isAdmin;
      }

      if (!isAdmin) {
        return res.status(403).json({ error: "Unauthorized. Admin access required." });
      }

      const emailsToNotify = new Set<string>();

      // Target: Users
      if (target === "users" || target === "both") {
        const usersSnapStandard = await getDocs(collection(dbStandard, "users"));
        usersSnapStandard.docs.forEach(d => {
          const data = d.data();
          if (data.email) emailsToNotify.add(data.email.toLowerCase().trim());
        });

        if (hasTwoDbs) {
          const usersSnapEnterprise = await getDocs(collection(dbEnterprise, "users"));
          usersSnapEnterprise.docs.forEach(d => {
            const data = d.data();
            if (data.email) emailsToNotify.add(data.email.toLowerCase().trim());
          });
        }
      }

      // Target: Newsletter
      if (target === "newsletter" || target === "both") {
        const newsSnapStandard = await getDocs(collection(dbStandard, "newsletter"));
        newsSnapStandard.docs.forEach(d => {
          const data = d.data();
          if (data.email) emailsToNotify.add(data.email.toLowerCase().trim());
        });

        if (hasTwoDbs) {
          const newsSnapEnterprise = await getDocs(collection(dbEnterprise, "newsletter"));
          newsSnapEnterprise.docs.forEach(d => {
            const data = d.data();
            if (data.email) emailsToNotify.add(data.email.toLowerCase().trim());
          });
        }
      }
      
      const config = getSmtpConfig();
      const transporter = getTransporter();

      let successCount = 0;
      let failCount = 0;

      const emailList = Array.from(emailsToNotify);

      for (const email of emailList) {
        try {
          await transporter.sendMail({
            from: config.from,
            to: email,
            subject: subject,
            html: `
              <div style="font-family: 'Inter', -apple-system, sans-serif; color: #1f2937; max-width: 600px; margin: 0 auto; border: 1px solid #f3f4f6; border-radius: 16px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                <div style="background-color: #6366f1; background-image: linear-gradient(to right, #6366f1, #8b5cf6); color: white; padding: 40px 20px; text-align: center;">
                  <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em;">WaifuWall</h1>
                  <p style="margin: 8px 0 0; opacity: 0.9; font-size: 14px; text-transform: uppercase; tracking: 0.1em;">Gallery Update</p>
                </div>
                <div style="padding: 40px; line-height: 1.8;">
                  <p style="font-size: 16px; margin-bottom: 24px;">Bonjour,</p>
                  <div style="font-size: 16px; color: #374151;">${message}</div>
                  
                  <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #f3f4f6;">
                    <p style="margin: 0; font-size: 14px; color: #6b7280;">
                      Cordialement,<br />
                      <strong style="color: #111827;">L'équipe WaifuWall</strong>
                    </p>
                  </div>
                </div>
                <div style="background-color: #f9fafb; padding: 24px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #f3f4f6;">
                  <p style="margin: 0;">&copy; ${new Date().getFullYear()} WaifuWall. Tous droits réservés.</p>
                  <p style="margin: 8px 0 0;">Vous recevez cet e-mail car vous êtes inscrit à notre galerie ou newsletter.</p>
                </div>
              </div>
            `
          });
          successCount++;
        } catch (err) {
          console.error(`Failed to send email to ${email}:`, err);
          failCount++;
        }
      }

      res.json({ 
        success: true, 
        message: `Broadcast complete. Sent: ${successCount}, Failed: ${failCount}`,
        stats: { successCount, failCount, total: emailList.length }
      });

    } catch (error) {
      console.error("Broadcast failed:", error);
      res.status(500).json({ error: "Broadcast failed" });
    }
  });

  // API placeholders
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "WaifuWall API is running" });
  });

  // Dynamic Sitemap
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const staticPages = ["", "/categories", "/trending", "/premium", "/login", "/register", "/help", "/privacy", "/terms", "/cookies", "/contact"];
      
      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

      // Static pages
      staticPages.forEach(page => {
        xml += `
  <url>
    <loc>${baseUrl}${page}</loc>
    <changefreq>daily</changefreq>
    <priority>${page === "" ? "1.0" : "0.8"}</priority>
  </url>`;
      });

      // Dynamic Categories
      const categoriesSet = new Set<string>();
      const catsSnapStandard = await getDocs(collection(dbStandard, "categories"));
      catsSnapStandard.docs.forEach(d => categoriesSet.add(d.id.toLowerCase()));
      
      if (hasTwoDbs) {
        const catsSnapEnterprise = await getDocs(collection(dbEnterprise, "categories"));
        catsSnapEnterprise.docs.forEach(d => categoriesSet.add(d.id.toLowerCase()));
      }

      categoriesSet.forEach(cat => {
        xml += `
  <url>
    <loc>${baseUrl}/category/${cat}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
      });

      // Dynamic Wallpapers
      const wallpapersSet = new Set<string>();
      const wallSnapStandard = await getDocs(collection(dbStandard, "wallpapers"));
      wallSnapStandard.docs.forEach(d => wallpapersSet.add(d.id));

      if (hasTwoDbs) {
        const wallSnapEnterprise = await getDocs(collection(dbEnterprise, "wallpapers"));
        wallSnapEnterprise.docs.forEach(d => wallpapersSet.add(d.id));
      }

      wallpapersSet.forEach(id => {
        xml += `
  <url>
    <loc>${baseUrl}/wallpaper/${id}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
      });

      xml += `
</urlset>`;

      res.header("Content-Type", "application/xml");
      res.status(200).send(xml);
    } catch (error) {
      console.error("Sitemap error:", error);
      res.status(500).send("Error generating sitemap");
    }
  });

  // Robots.txt
  app.get("/robots.txt", (req, res) => {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /profile

Sitemap: ${baseUrl}/sitemap.xml`;
    
    res.header("Content-Type", "text/plain");
    res.status(200).send(robots);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`WaifuWall Server running at http://localhost:${PORT}`);
  });
}

startServer();

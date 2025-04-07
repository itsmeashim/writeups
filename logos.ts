import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"
import toIco from "to-ico"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SOURCE_LOGO = path.join(__dirname, "public", "logo.png")
const ICONS_DIR = path.join(__dirname, "public", "icons")
const FAVICON_PATH = path.join(__dirname, "public", "favicon.ico")

// Create icons directory if it doesn't exist
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true })
}

// PWA icon sizes
const PWA_ICONS = [
  { size: 72, filename: "icon-72x72.png" },
  { size: 96, filename: "icon-96x96.png" },
  { size: 128, filename: "icon-128x128.png" },
  { size: 144, filename: "icon-144x144.png" },
  { size: 152, filename: "icon-152x152.png" },
  { size: 192, filename: "icon-192x192.png" },
  { size: 384, filename: "icon-384x384.png" },
  { size: 512, filename: "icon-512x512.png" },
]

// Generate PWA icons
async function generatePWAIcons() {
  try {
    for (const icon of PWA_ICONS) {
      await sharp(SOURCE_LOGO)
        .resize(icon.size, icon.size)
        .toFile(path.join(ICONS_DIR, icon.filename))
    }
    console.log("PWA icons generated successfully!")

    // Generate favicon.ico from the 72x72 icon
    const icon72Path = path.join(ICONS_DIR, "icon-72x72.png")
    const icon72Buffer = await fs.promises.readFile(icon72Path)

    // Create favicon sizes from the 72x72 icon
    const faviconSizes = [16, 32, 48]
    const faviconBuffers = await Promise.all(
      faviconSizes.map((size) =>
        sharp(icon72Buffer).resize(size, size).toFormat("png").toBuffer()
      )
    )

    // Combine all sizes into one ICO file
    const icoBuffer = await toIco(faviconBuffers)
    fs.writeFileSync(FAVICON_PATH, icoBuffer)
    console.log("Favicon generated successfully!")
  } catch (error) {
    console.error("Error generating icons:", error)
  }
}

void generatePWAIcons()

# Jacaranda Café: Cafe Website (Task 2)

A one-page website for a neighbourhood café in Parkhurst, Johannesburg. It has a menu of 25 items in five categories, the café's story and services, a photo gallery, customer reviews, a table reservation form and online ordering for pickup.

**Tech:** HTML5, CSS3 (custom properties, grid, `color-mix`), vanilla JavaScript, LocalStorage. No frameworks and no build step.

## Brief checklist

| Requirement | Where |
|---|---|
| Homepage: hero, café introduction, typography and images, call-to-action buttons | Hero section of `index.html` |
| Menu: coffee, fast food, desserts, beverages, specials, each with image, name, description and price | Menu section, with category tabs (data in `js/data.js`) |
| About us: story, services, environment, quality and specialities | "Our story" section |
| Contact and reservation form: name, contact details, date/time, message | "Book a table" section |
| Form validation | Name, SA phone number, email, date within 60 days, and time slots that follow the real opening hours (last seating an hour before close) |
| Gallery section | 6 images with a keyboard-accessible lightbox |
| Responsive design | Tested at 360px, 768px and 1366px |
| Navigation bar and footer with social/contact links | Sticky header with the current section highlighted; footer with Instagram, Facebook, TikTok and WhatsApp |

## Bonus features included

- **Online ordering UI**: add items from the menu, change quantities in a side drawer, pick a collection time and place the order
- **Table booking system** with seating preference (terrace, inside or no preference)
- **Customer reviews carousel** with buttons, dots and swipe on touch screens
- **Dark mode**, remembered between visits
- **"Open now" indicator** that uses Johannesburg time, wherever the visitor is
- **Image lightbox** with arrow-key and Escape support
- A single shower of jacaranda petals on page load (turned off when reduced motion is on)

## Folder structure

```
cafe/
├── index.html        The whole site (single page with sections)
├── 404.html          Not-found page
├── css/styles.css    All styles, light and dark themes
├── js/
│   ├── data.js       Menu, gallery, reviews, opening hours
│   └── app.js        Theme, nav, menu tabs, cart, lightbox, carousel, reservations
└── assets/img/       Illustrations (SVG) for menu items, gallery and hero
```

## Design

Built around Johannesburg's jacaranda season: jacaranda purple, blossom lilac and leaf green, with Bricolage Grotesque for headings and Instrument Sans for body text. The menu uses dotted leader lines between dish and price, like a printed café menu.

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy to AWS

### Option A: AWS Amplify Hosting (easiest)

1. Sign in to the AWS Console and open **AWS Amplify**.
2. Choose **Create new app**, then **Deploy without Git**, then **Next**.
3. App name: `jacaranda-cafe`. Branch name: `main`.
4. For **Method**, choose **Drag and drop**, then drop **`jacaranda-cafe.zip`** (this zip, as it is: `index.html` is already at the top level).
5. Choose **Save and deploy**, then open the domain shown on the app's overview page.

Optional custom 404 page: **Hosting → Rewrites and redirects → Manage redirects**, then add source `/<*>`, target `/404.html`, type `404 (Rewrite)`.

To update the site later, zip the files again and drag the zip onto the app's deployment page.

### Option B: Amazon S3 static website (+ CloudFront for HTTPS)

1. Create an S3 bucket, e.g. `jacaranda-cafe-<yourname>`, in a nearby region such as `af-south-1` (Cape Town).
2. Upload the files so `index.html` sits at the top of the bucket. With the AWS CLI, run this from inside the unzipped folder:
   ```bash
   aws s3 sync . s3://jacaranda-cafe-<yourname> --delete --exclude "README.md" --exclude "screenshots/*"
   ```
3. Bucket → **Properties** → **Static website hosting** → Enable. Index document: `index.html`. Error document: `404.html`.
4. Bucket → **Permissions** → turn off **Block all public access**, and add this bucket policy:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [{
       "Sid": "PublicReadGetObject",
       "Effect": "Allow",
       "Principal": "*",
       "Action": "s3:GetObject",
       "Resource": "arn:aws:s3:::jacaranda-cafe-<yourname>/*"
     }]
   }
   ```
5. Open the bucket website endpoint shown under Static website hosting (HTTP only). For HTTPS, put a **CloudFront** distribution in front of the bucket, with `index.html` as the default root object.

## Notes

- **No backend:** bookings, orders and results are saved in the visitor's browser with `localStorage`, so they stay on that device only. Sign-in and payment screens are UI only, with no real passwords stored and no payment taken.
- **Images** are original SVG illustrations made for this project. To use real photos, replace the files in `assets/` or change the image paths in `js/data.js`.
- **Screenshots** in `screenshots/` were taken without the Google Fonts loaded, so the lettering on the live site looks a little different.

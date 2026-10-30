# Eagle Vision Logistics website

A fast, responsive static website for GitHub Pages. No build step or installs needed.

## What's new in this version
- **Shipment tracking.** A "Track your shipment" section sits right under the top slides (and in the menu). Customers type their tracking number and see status, route, estimated arrival, a progress bar and the full update history. Links like `https://your-site/?track=EVL-ABCDE-12345` open straight to the result, so you can put them in emails and WhatsApp messages. See "Shipment tracking" below.
- **Quote form now uses Web3Forms** (see "Contact form"), and works on phones, tablets and desktops. The header menu now collapses to the burger button below 1080px wide so it never overflows.
- **Font styles.** Nine professional presets to choose from. See "Choosing a font" below.
- **Core values** reworded to be tighter and more polished, shown as numbered cards
- **Hover animations** across the site: cards tilt and glow toward the mouse, icons spin to gold, buttons get a shine sweep, gallery photos show a zoom badge, and the hero photo drifts gently with the mouse. Touch screens and visitors who prefer reduced motion get the calm version.
- **Quote form** now keeps the service list in step with `data.js`, pre-selects the service when someone clicks "Request a quote" in a service pop-up, and if sending fails it keeps the visitor's details and offers WhatsApp / email buttons with everything pre-filled, so no enquiry is lost
- Cleaner, more professional design built around the logo's navy and gold
- **Dark mode switch** in the header. The visitor's choice is saved in their browser, so it is still applied after a refresh, closing the tab or restarting the device. First-time visitors get their device's light/dark setting.
- Services first, with a clear quote form and contact panel
- Dedicated Mission and Vision section, core values with icons, photo gallery with enlarge view
- Faster loading (large hero image compressed), better phone layout, keyboard and screen-reader friendly

## Files
| File | What it does |
|---|---|
| `index.html` | Page structure |
| `styles.css` | All styling, including the light and dark themes |
| `script.js` | Page behaviour (slider, dark-mode switch, form, pop-ups) |
| `data.js` | **All the text and picture choices.** Edit this to change content |
| `tracking.js` | **Shipment records** (managed from the Shipment tracking tab in `admin.html`) |
| `shared.js` | Font presets, tracking stages and the tracking-number hash |
| `admin.html` | Optional browser editor for `data.js` and pictures |
| `images/`, `logo.jpeg`, `logo-mark.png`, `favicon.png`, `apple-touch-icon.png` | Pictures and icons |

## Preview locally
Open `index.html` in a browser, or from this folder run:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Publish on GitHub Pages
1. Upload the **contents** of this folder (not the folder itself) to the root of your repository, so `index.html` sits at the top level.
2. In GitHub open **Settings → Pages**, choose your `main` branch and the `/ (root)` folder, then save.
3. Wait a minute or two, then open the address GitHub shows you.

If you are replacing an earlier version, you can delete `images/port-hero.png` and the old numbered pictures in `images/` (for example `1793272866807.jpg`). They are no longer used.

## Dark mode: how it is saved
The choice is stored in the visitor's browser (`localStorage`, key `evl-theme`). It is applied before the page paints, so there is no flash of the wrong theme. To reset it while testing, clear the site's data in your browser.

## Contact form (Web3Forms)
Quote requests are sent through [Web3Forms](https://web3forms.com), a free service that emails each request to you. No activation step on the live site is needed, just a free access key.

1. Go to https://web3forms.com and enter the email address that should **receive** quote requests.
2. Web3Forms emails you an **access key** (a code like `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`).
3. Put it in the site: open `admin.html`, choose **Company and contact**, paste it into **Web3Forms access key** and publish. Or edit `data.js` and set `"web3formsKey": "your-key-here"`.
4. Open the live site, send yourself a test quote, and check that it arrives (also check Spam the first time).

The access key is designed to be public (it only allows sending to the email you registered), so it is safe to keep in `data.js`.

If `web3formsKey` is empty, the form falls back to Formspree (`site.formUrl`) and then to FormSubmit, which needs its own one-time email activation.

If a request cannot be sent, the visitor keeps what they typed and sees WhatsApp and email buttons that carry their details, plus your phone number. To see the exact reason a send failed, open the browser console (F12) and look for `Quote form not delivered:`.

## Before you call the site live
- Check the phone, email, WhatsApp number and address in `data.js`, and test every link.
- Confirm the service descriptions match what the business can actually provide.
- The pictures are illustrative images, not photos of completed jobs. Replace them with real operational photos when you have them.
- Team photos and client quotes stay hidden until you add real ones (use `admin.html` or `data.js`).

## Admin page security
`admin.html` publishes changes to GitHub using a fine-grained personal access token with **Contents: Read and write** on this repository only. Never share the token or commit it. Do not tick "Remember on this device" on a shared computer. The page runs in the browser, so treat it as a convenience for trusted administrators, not a private login.

## Shipment tracking
This is a static site, so tracking works from a data file (`tracking.js`) rather than a live server. You update shipments in `admin.html` and publish; the site picks the change up about a minute later.

**Add a shipment**
1. Open `admin.html`, connect to GitHub (see Admin page security), then choose **Shipment tracking**.
2. Press **New shipment**. A tracking number such as `EVL-K7X2M-9QPA4` is generated. Copy it (or the direct link) and send it to your customer. Keep your own record of which customer has which number.
3. Fill in mode, origin, destination, current status, estimated arrival and cargo description. The first update ("Booked") is already there.
4. Press **Publish to GitHub**. The number works on the site after the site refreshes.

**Update a shipment later:** open its record, change **Current status** (this moves the progress bar), press **Add update** for a new history line (date, location, title, note), then publish. Use **Delay or hold notice** for a red warning banner.

**Statuses, in order:** Booked, Cargo received, In transit, Arrived at destination, Customs clearance, Out for delivery, Delivered.

**Privacy: please read**
- `tracking.js` is public. It stores only a one-way hash of each tracking number, so a visitor cannot list your shipments, and numbers are long random codes that cannot be guessed.
- Anyone who has a tracking number can see that shipment's record. **Do not put customer names, phone numbers, invoice values or other private details in the records.**
- Because the file holds hashes, `admin.html` can only show a number on the device where it was created. On another device a shipment shows as "Number not known" until you type its number to unlock the label. Tracking still works for customers either way.
- Delete finished shipments you no longer need.
- The file `tracking.js` currently contains one **demo shipment** (number `EVL-DEMO-12345`). Try it, then delete it in the admin before you go live.

**Without the admin:** you can also edit `tracking.js` by hand, but the keys are hashes, so using the admin is much easier.

## Choosing a font
Set the font in `admin.html` (Company and contact, then **Font style**, which shows a live preview) or by changing `"font"` in `data.js` to one of:

| Value | Look |
|---|---|
| `classic` | Chakra Petch + Public Sans (the current look) |
| `corporate` | Montserrat + Source Sans 3 |
| `modern` | Poppins + Open Sans |
| `clean` | Inter |
| `roboto` | Roboto |
| `friendly` | Nunito Sans |
| `technical` | IBM Plex Sans |
| `executive` | Playfair Display (serif headings) + Lato |
| `system` | The visitor's own system fonts (fastest, nothing to download) |

**Try before you commit:** add `?font=corporate` to the site address (for example `index.html?font=corporate`) to preview any option without changing anything.

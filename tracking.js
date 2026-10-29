/* Shipment tracking data. Managed from admin.html (Shipment tracking tab).
   Tracking numbers are NOT stored here, only a one-way hash of each, so visitors cannot browse the list.
   The record below is a DEMO: look it up with  EVL-DEMO-12345  then delete it in admin.html before going live. */
window.TRACKING = {
  "updated": "2026-10-29",
  "shipments": {
    "a5c48010696193200e1fe88a9e826a3e7cab07111f10ddc136d7cc4a32f806c4": {
      "mode": "Sea freight",
      "origin": "Shanghai, China",
      "destination": "Tema, Ghana",
      "status": "In transit",
      "eta": "2026-11-18",
      "cargo": "DEMO shipment: 1 x 40ft container of general cargo",
      "alert": "",
      "events": [
        {
          "date": "2026-10-12T09:30",
          "location": "Shanghai, China",
          "status": "Booked",
          "note": "Booking confirmed with carrier"
        },
        {
          "date": "2026-10-15T14:00",
          "location": "Shanghai, China",
          "status": "Cargo received",
          "note": "Container loaded and sealed"
        },
        {
          "date": "2026-10-19T06:45",
          "location": "Shanghai Port, China",
          "status": "In transit",
          "note": "Vessel departed"
        },
        {
          "date": "2026-10-27T11:20",
          "location": "Singapore",
          "status": "In transit",
          "note": "Transhipment completed"
        }
      ]
    }
  }
};

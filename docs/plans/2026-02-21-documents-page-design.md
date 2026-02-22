# Documents Page Design

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a beautiful reading experience for the Airbnb host information at /docs

**Architecture:** Server component fetches document from Supabase, renders markdown with react-markdown using design system typography (Tenor Sans headers, Libre Baskerville body, max 65ch width).

**Tech Stack:** Next.js App Router, Supabase, react-markdown

---

## Design Decisions

### Typography
- Headers: Tenor Sans (existing design system)
- Body: Libre Baskerville, line-height 1.7
- Max width: 65ch for optimal readability

### Layout
- Centered content
- Padding: 16px mobile, 24px desktop
- Section spacing: 2rem

### Data
- Single document, stored in `documents.content` column as markdown
- doc_type: 'airbnb_info'

---

## Formatted Document Content

```markdown
# The House at River's Bend

**55026 Marten Lane, Bend, OR**

---

Haleigh & Friends,

Here are some instructions to make your stay a little easier.

## Access

**House key code** (to all doors including garage): `5126`

Check in anytime **Thursday, February 26**. Check out anytime **Sunday, March 1**. (We are not strict about times!)

## Heating

The house will be cold upon arrival. Here's how to warm it up:

1. Turn living room heat to **69 degrees**
2. Turn on the gas fireplace — the switch is in the living room between the two sliders (left switch)
3. Head downstairs and turn on the heat (thermostat is in the hallway)
4. All bedrooms and the pool table area have portable heaters for quick warming

## Amenities

### Hot Tub
Set to 102° with fresh chemicals.

### Garage & Outdoor Gear
- **3 usable bikes** including 2 e-bikes
- Trekking poles and snowshoes in the garage cupboard (right of the fridge)

### Kitchen
Fully stocked with coffee pot, air fryer, Insta-Pot, griddle, and every type of pot & pan imaginable. Two fridges — one in the house, one in the garage.

### Entertainment
- Pool table and ping pong table (downstairs)
- TVs upstairs and downstairs with Netflix streaming
- **WiFi:** Select `Netgear 51` — password: `blacksky217`

### Bedrooms
3 king beds + 6 other beds throughout the house.

### Provided
Beach towels, bath towels, soap, shampoo, hairdryers. Medicine cabinet in the master bathroom has extra supplies.

---

## What to Bring

- Food
- Alcohol
- Coffee
- Cocoa

Basic items are in the house — feel free to use whatever you find!

---

## E-Bike Notes

The 2 e-bikes are in the garage. You can ride right out the back gate onto forest service roads and trails, or bike all the way to La Pine State Park.

**Rules:**
- E-bikes are **not allowed** on river trails (National Forest prohibits motorized vehicles)
- **Do not leave bikes plugged into chargers** when leaving the house — it's unsafe

---

## Before You Leave

Please help with the following:

- Run the dishwasher
- Hang wet towels on hooks in the laundry room
- Strip sheets from beds you used and pile them on the bed
- Empty the fridge (both fridges)
- Empty all trash and pull can to end of driveway (pickup is Monday!)
- Excess trash/recycling can go in the garage
- Lock all doors by re-entering code `5126` and turning the deadbolt

*Please don't stress about cleaning thoroughly — just these basics help a lot!*

---

## Shopping Nearby

| Location | Notes |
|----------|-------|
| Sun River Village | Closest, but very expensive |
| La Pine | Has Grocery Outlet + expensive grocery store |
| Bend | Best option — shop before heading to house |

---

## Contact

**Stacie & Joe Backus**

- Stacie: 503-866-8519
- Joe: 503-860-5557

*No question is too crazy — reach out if you need anything!*

---

Enjoy your stay! We finally have fresh snow!

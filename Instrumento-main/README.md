# Instrumento

# Instrumento — Master Product & Engineering Specification

## 1. Product Overview

Build a production-quality web application called **Instrumento**.

Instrumento is an interactive browser-based virtual instrument platform. Users can create an account, log in, select an instrument, play it directly in the browser using their mouse or computer keyboard, record their playing, use a metronome, and access instrument tuners.

The initial instruments are:

* Piano

* Guitar

* Drums

* Ukulele

The initial tuners are:

* Guitar tuner

* Ukulele tuner

The application should prioritize **real functionality over visual complexity**. If a perfect 3D instrument graphic is difficult to implement, simplify the graphic rather than sacrificing interaction, audio quality, keyboard control, recording, or usability.

---

# 2. NON-NEGOTIABLE DESIGN DIRECTION

## Do NOT make Instrumento look like a generic AI/vibe-coded website.

Avoid:

* Generic SaaS landing-page layouts

* Excessive rounded cards

* Random gradients

* Purple/blue AI-dashboard aesthetics

* Excessive glassmorphism

* Generic Tailwind component-library appearance

* Huge meaningless hero sections

* Unnecessary animations

* Stock illustrations

* Generic "modern startup" UI

* Overuse of shadows

* Every element being inside a card

* Making the interface look like an admin dashboard

Instrumento should feel like a **real musical instrument application**.

The interface should feel intentional, tactile, responsive, and slightly experimental.

The design should communicate:

> "This is an instrument you can play."

not:

> "This is a SaaS dashboard with an instrument inside it."

### Figma is the visual source of truth

The user will connect a Figma MCP server.

**Before implementing the final visual design, inspect the Figma MCP/design files.**

Do not invent a competing design system if the Figma design already establishes:

* Typography

* Colors

* Spacing

* Components

* Instrument layouts

* Navigation

* Icons

* Buttons

* Controls

* Animation behavior

* Responsive behavior

Implement the Figma design faithfully.

If something is not specified in Figma, make a restrained design decision that is consistent with the existing visual language.

---

# 3. TECH STACK

Use:

### Frontend

* React

* Vite

* JavaScript or TypeScript

* React Router

* CSS/Tailwind only where appropriate

* Web Audio API

* Tone.js where it simplifies instrument/audio implementation

Tone.js is particularly suitable because it provides browser-based musical primitives, polyphonic synthesis, sample playback, scheduling, transport/metronome functionality, and `Tone.Sampler`.

### Backend

* Node.js

* Express.js

* MongoDB-compatible architecture only if needed

However, the primary database requirement is:

### Database

**Neon PostgreSQL**

Do NOT introduce MongoDB merely because the project is called MERN.

The application should therefore use:

* React

* Node

* Express

* PostgreSQL/Neon

If the project absolutely requires MongoDB for an existing dependency, document why before introducing it.

The database should be relational and hosted on Neon.

### Deployment

Use:

**Netlify**

Frontend should be deployable through Netlify.

Backend/API should use a Netlify-compatible deployment strategy or a separate serverless/API deployment where necessary.

Do not make the architecture dependent on localhost.

---

# 4. CORE USER FLOW

The primary flow should be:

Landing page

→ Sign up / Log in

→ Instrumento application

→ Instruments / Tuners

→ Select instrument

→ Configure instrument

→ Play

→ Record / use metronome / controls

→ Save recording/session where appropriate

Authentication should support:

* Sign up

* Log in

* Log out

* Persistent authentication

* Protected application routes

* Basic account/profile information

Do not build fake authentication.

Passwords must never be stored as plaintext.

Use secure password hashing and secure session/token handling.

---

# 5. APPLICATION STRUCTURE

The main application should have two major sections:

## Instruments

* Piano

* Guitar

* Drums

* Ukulele

## Tuners

* Guitar tuner

* Ukulele tuner

The navigation should make switching between these areas obvious.

Instrument pages should share reusable functionality rather than implementing everything independently.

For example:

```text

Instrumento

├── Auth

│   ├── Login

│   └── Signup

│

├── App

│   ├── Instruments

│   │   ├── Piano

│   │   ├── Guitar

│   │   ├── Drums

│   │   └── Ukulele

│   │

│   └── Tuners

│       ├── Guitar Tuner

│       └── Ukulele Tuner

│

└── Shared

    ├── Recorder

    ├── Metronome

    ├── Transport

    ├── Volume

    ├── Instrument Controls

    └── Audio Engine

```

---

# 6. AUDIO ENGINE — VERY IMPORTANT

Do not implement instrument buttons that merely animate visually.

Every playable instrument must produce actual sound.

Use the **Web Audio API** as the underlying browser audio system. It is designed for routing audio sources, effects, buffers, and real-time audio processing.

Tone.js may sit on top of Web Audio for:

* Instrument synthesis

* Sampling

* Polyphony

* Scheduling

* Metronome

* Effects

* Note triggering

Use sampled sounds when realistic instrument sounds are required.

`Tone.Sampler` can map recorded notes to pitches and interpolate missing notes, which is useful for reducing the number of audio files that need to be loaded.

---

# 7. WHERE TO GET INSTRUMENT SOUNDS

Do NOT randomly download copyrighted audio from YouTube or other questionable sources.

Prefer legally reusable/publicly available instrument samples.

A particularly useful source to investigate is the **University of Iowa Musical Instrument Samples** collection. The University states that its recordings are freely available and may be downloaded and used for projects without restrictions.

Use appropriate samples for:

* Piano

* Guitar

* Ukulele

* Percussion/drums

Before shipping any third-party sample:

1. Verify the license.

2. Store the relevant license information in the project documentation.

3. Keep the audio assets locally in the project or in an appropriate asset/CDN location.

4. Do not hotlink critical production audio from an unreliable third-party server.

5. Optimize file sizes.

Recommended structure:

```text

public/

└── audio/

    ├── piano/

    │   ├── grand/

    │   ├── electric/

    │   └── soft/

    │

    ├── guitar/

    │   ├── acoustic/

    │   └── electric/

    │

    ├── ukulele/

    │

    └── drums/

        ├── kick/

        ├── snare/

        ├── hihat/

        ├── tom/

        └── crash/

```

Do not load every sample on initial page load.

Lazy-load instrument assets.

Show a small loading state such as:

> Loading instrument…

and only enable playing when the required samples are ready.

---

# 8. BROWSER AUDIO INITIALIZATION

Browsers can restrict audio until the user interacts with the page.

Therefore:

* Do not initialize the entire audio system and expect it to work automatically.

* Initialize/resume the AudioContext after a deliberate user interaction.

* The first instrument interaction should safely call the required audio initialization.

* Handle suspended AudioContexts.

* Give the user a clear "Enable Audio" state if necessary.

The application should never appear broken simply because browser audio has not yet been unlocked.

---

# 9. PIANO

The piano is one of the most important instruments.

## Visual requirements

Implement:

* Piano keyboard

* White keys

* Black keys

* Clearly visible pressed state

* Current octave/range

* Tone/type selector

* Volume

* Sustain

* Metronome

* Record

* Playback controls

The piano should look convincing enough to communicate that it is playable.

Perfect physical realism is NOT required.

Functionality is more important.

---

# 10. PIANO TONES

Provide multiple piano/tone options.

At minimum:

* Grand Piano

* Soft Piano

* Electric Piano

If high-quality samples are available, use samples.

If samples are unavailable for a specific tone, use Tone.js synthesis as a fallback rather than leaving the instrument silent.

Changing tone should change the actual audio engine, not merely change a label.

---

# 11. PIANO COMPUTER KEYBOARD CONTROL

This is REQUIRED.

The user should be able to play the piano without clicking individual keys.

Use browser keyboard events:

```text

keydown

keyup

```

Do NOT only use `keypress`.

Create an explicit keyboard mapping.

For example, a beginner-friendly mapping can use:

```text

A W S E D F T G Y H U J K

```

where:

```text

A = C

W = C#

S = D

E = D#

D = E

F = F

T = F#

G = G

Y = G#

H = A

U = A#

J = B

K = C

```

The exact mapping can be changed if the Figma design specifies another layout.

Display the mapping visually near the keyboard.

Example:

```text

   W   E       T   Y   U

  C#  D#      F#  G#  A#

 A   S   D F   G   H   J K

 C   D   E F   G   A   B C

```

## Keyboard implementation requirements

Maintain a mapping object:

```js

const keyboardMap = {

  a: "C4",

  w: "C#4",

  s: "D4",

  e: "D#4",

  d: "E4",

  f: "F4",

  t: "F#4",

  g: "G4",

  y: "G#4",

  h: "A4",

  u: "A#4",

  j: "B4",

  k: "C5"

};

```

On `keydown`:

1. Normalize the key.

2. Check whether it exists in the mapping.

3. Ignore repeated `keydown` events.

4. Trigger note attack.

5. Mark the corresponding piano key visually active.

6. Add the note to the recorder event stream if recording.

On `keyup`:

1. Trigger note release.

2. Remove the active visual state.

3. Record note-off timing if recording.

Use:

```js

event.repeat

```

to avoid repeatedly triggering the same note when a user holds a key.

Do NOT trigger the same note multiple times because of browser key-repeat behavior.

---

# 12. PIANO MOUSE CONTROL

The same underlying note engine must power both:

* Mouse interaction

* Keyboard interaction

Do not create two separate audio implementations.

Clicking/touching a piano key should:

```text

pointerdown → note attack

pointerup → note release

pointerleave → safely release note

```

Use pointer events rather than separate mouse-only logic so the implementation can later support touch devices.

---

# 13. PIANO OCTAVE CONTROL

Add a simple octave/range control.

For example:

```text

− Octave 4 +

```

Changing octave changes the keyboard mapping.

Do not unnecessarily render the entire 88-key piano if it makes the UI unusable.

A smaller playable range with octave navigation is acceptable.

---

# 14. SUSTAIN PEDAL

Every melodic instrument should have a sustain control where musically appropriate.

For piano:

Create a visible sustain pedal/button.

Support:

* Mouse/pointer hold

* Keyboard shortcut

* Toggle/hold behavior depending on design

Recommended keyboard shortcut:

```text

Space

```

However, Space should not interfere with normal page scrolling when the piano is active.

When sustain is active:

* Releasing a piano key should not immediately stop the audio.

* Keep the note active until sustain is released.

* Then release all notes whose physical keys have already been released.

This behavior should resemble a real sustain pedal.

---

# 15. GUITAR

The guitar should have:

* Guitar body/fretboard

* Strings

* Frets

* String interaction

* Fret selection

* Horizontal fret slider/navigation

* Acoustic/electric toggle

* Volume

* Sustain where appropriate

* Record

* Metronome

## Fret navigation

The user specifically requested a slider to move through the frets.

Implement:

```text

← fret range ─────────────→

```

or an equivalent Figma-designed control.

The fretboard should update when the slider changes.

At minimum support enough frets for normal beginner playing.

Do not render an unnecessarily enormous fretboard if it harms performance.

---

# 16. GUITAR PLAYING MODEL

Clicking a string/fret should calculate the resulting pitch.

Represent guitar tuning explicitly.

Default standard tuning:

```text

E2

A2

D3

G3

B3

E4

```

Then calculate pitch based on:

```text

open string MIDI note + fret number

```

This allows the same audio engine to generate the correct note.

Use sampled guitar audio when possible.

For acoustic mode:

* Use acoustic guitar samples.

For electric mode:

* Use electric guitar samples or an appropriate synthesized fallback.

The toggle must actually change the sound.

---

# 17. GUITAR STRUMMING

Support:

* Individual string clicking

* Basic strumming gesture if practical

* Keyboard mapping

Do not attempt to build a fully realistic guitar physics simulation in the first version.

Functional simplicity is preferred.

---

# 18. GUITAR KEYBOARD CONTROL

Provide a keyboard layout for:

* Individual strings

* Common fret positions

* Optional strumming

The mapping should be visible to the user.

Do not make users guess which keys control which strings.

Keyboard input must use the same central audio/note engine as mouse input.

---

# 19. DRUMS

Keep drums simple.

Create a visually clear drum kit containing at minimum:

* Kick

* Snare

* Closed hi-hat

* Open hi-hat

* Tom

* Crash

Potentially add:

* Ride

Each drum should respond to:

* Pointer/click

* Keyboard

Example mapping:

```text

A = Kick

S = Snare

D = Closed Hi-Hat

F = Open Hi-Hat

G = Tom

H = Crash

```

The exact mapping can change according to the design.

Drums should use short audio samples rather than trying to synthesize every drum from scratch.

---

# 20. DRUM SUSTAIN

A traditional piano sustain pedal does not make sense for all drums.

Therefore:

* Do not force a piano-style sustain pedal onto drums.

* Instead, expose useful drum controls such as:

  * Volume

  * Metronome

  * Record

  * Tempo

If a Figma design contains a pedal-style control, interpret it musically rather than mechanically copying the piano behavior.

---

# 21. UKULELE

Keep the ukulele simpler than guitar.

Default tuning:

```text

G4

C4

E4

A4

```

Provide:

* Four strings

* Fret interaction

* Basic fret navigation

* Keyboard control

* Strumming/clicking

* Volume

* Sustain/hold where appropriate

* Record

* Metronome

Use real ukulele samples where possible.

The ukulele interface should reuse guitar architecture where technically sensible, but visually remain its own instrument.

---

# 22. SHARED INSTRUMENT CONTROLS

Every instrument page should provide a consistent set of shared controls.

At minimum:

```text

Record

Play/Pause

Stop

Metronome

Tempo

Volume

```

Where musically appropriate:

```text

Sustain

Tone

Instrument mode

Octave

```

Do not duplicate logic separately inside every instrument.

Create reusable components/services.

---

# 23. METRONOME

Implement a real metronome.

Requirements:

* BPM control

* Start/stop

* Audible click

* Visual beat indicator

* Tempo range approximately 40–240 BPM

* Beat synchronization

The metronome should use accurate audio scheduling rather than simply relying on:

```js

setInterval()

```

for the actual audio click.

Tone.js provides transport and scheduling functionality suitable for this type of musical timing.

The visual animation can use normal browser timing, but audio timing should be scheduled through the audio engine.

---

# 24. RECORDING

Every instrument must have a functional Record button.

The recording system should capture the user's performance.

Do not make Record merely change the button color.

There are two useful layers:

## Layer 1 — Musical event recording

Record events such as:

```js

{

  instrument: "piano",

  note: "C4",

  action: "attack",

  timestamp: 1234

}

{

  instrument: "piano",

  note: "C4",

  action: "release",

  timestamp: 1452

}

```

This is important because it allows:

* Playback

* Editing later

* Tempo changes

* Instrument changes

* Replaying the performance

## Layer 2 — Audio recording

Where practical, provide actual audio recording/export.

The browser's MediaRecorder API can record a `MediaStream`.

For Instrumento, route the instrument audio through an audio destination that can be recorded, rather than depending only on microphone input.

The final architecture should therefore separate:

```text

Instrument input

       ↓

Audio engine

       ↓

Effects / volume

       ↓

Master output

       ├── Speakers

       └── Recording destination

```

This allows the application to record the instrument audio itself.

---

# 25. RECORDING UI

The Record button should have clear states:

```text

Idle

Recording

Paused

Finished

```

While recording:

* Show elapsed time

* Show clear recording indicator

* Capture note events

* Capture metronome timing if relevant

* Prevent accidental navigation if possible

After recording:

```text

Play

Pause

Delete

Save

```

If authentication is available, allow saved recordings to be associated with the user.

---

# 26. PLAYBACK

Recorded musical events should be playable.

For example:

```text

Record

↓

Stop

↓

Playback

↓

Original notes are triggered at their recorded timings

```

Playback should use the same audio engine.

This creates an important architectural rule:

> Live playing and playback must use the same instrument engine.

Do not create one implementation for live notes and another completely separate implementation for recorded playback.

---

# 27. USER RECORDINGS DATABASE

For authenticated users, create a recordings table similar to:

```text

recordings

-----------

id

user_id

name

instrument

duration

bpm

events

audio_url

created_at

updated_at

```

The `events` field can use PostgreSQL JSON/JSONB.

Do not store large audio blobs directly inside PostgreSQL unless there is a very specific reason.

Use object/file storage for larger recordings and store the URL/reference in Neon.

---

# 28. TUNERS

Build:

## Guitar Tuner

and

## Ukulele Tuner

The tuner should use the microphone.

Ask for microphone permission clearly.

Use:

```text

navigator.mediaDevices.getUserMedia({

  audio: true

})

```

Then process the microphone signal through Web Audio.

The tuner should estimate the fundamental frequency and compare it against the target note.

Display:

```text

Detected note

Frequency

Flat / In tune / Sharp

Pitch deviation

```

Use a visual tuning indicator such as:

```text

Flat ←──── ● ────→ Sharp

             ↑

           In Tune

```

Do not pretend that the tuner is working if microphone permission has been denied.

Provide a clear permission/error state.

---

# 29. GUITAR TUNER NOTES

Default standard tuning:

```text

E2

A2

D3

G3

B3

E4

```

The tuner should identify which string is closest to the detected frequency.

---

# 30. UKULELE TUNER NOTES

Default standard tuning:

```text

G4

C4

E4

A4

```

Display the target string/note and tuning deviation.

---

# 31. RESPONSIVENESS

Instrumento should work on:

* Desktop

* Laptop

* Tablet

* Mobile where practical

However, prioritize desktop/laptop first because physical keyboard interaction is an important feature.

Do not simply shrink the desktop UI until it breaks.

For mobile:

* Provide touch-friendly instrument interaction.

* Hide keyboard shortcut instructions when a physical keyboard is unavailable.

* Make the instrument viewport scrollable where necessary.

---

# 32. KEYBOARD INPUT ARCHITECTURE

Create a centralized keyboard/input manager.

Do not put:

```js

window.addEventListener("keydown", ...)

```

inside every piano key component.

Instead:

```text

KeyboardInputManager

        ↓

Instrument Controller

        ↓

Audio Engine

        ↓

Instrument

```

The manager should handle:

* Keydown

* Keyup

* Active keys

* Duplicate keydown prevention

* Keyboard focus

* Instrument-specific mappings

When the user is typing inside an input field, keyboard instrument shortcuts should generally be disabled.

For example:

```js

if (

  event.target instanceof HTMLInputElement ||

  event.target instanceof HTMLTextAreaElement

) {

  return;

}

```

---

# 33. AUDIO ENGINE ARCHITECTURE

Create a reusable audio service.

Something conceptually like:

```text

AudioEngine

├── initialize()

├── resume()

├── loadInstrument()

├── playNote()

├── releaseNote()

├── playDrum()

├── setVolume()

├── setInstrument()

├── setSustain()

├── getMasterOutput()

└── dispose()

```

Instrument-specific engines can sit above this:

```text

PianoEngine

GuitarEngine

DrumEngine

UkuleleEngine

```

But they should share the same underlying audio infrastructure.

---

# 34. SAMPLE LOADING

Do not load every sample simultaneously.

Use lazy loading.

Example:

```text

User opens Piano

↓

Load piano samples

↓

Piano ready

```

Then:

```text

User switches to Guitar

↓

Load guitar samples

↓

Guitar ready

```

Use caching so already-loaded instruments do not reload unnecessarily.

Tone.js `Sampler` can be used to map a smaller collection of sampled notes across a playable range.

---

# 35. AUDIO PERFORMANCE

Avoid:

* Creating unnecessary AudioContexts

* Creating huge numbers of audio nodes without cleanup

* Downloading hundreds of audio files on startup

* Reinitializing the sampler for every note

* Triggering notes repeatedly from keyboard auto-repeat

Use one primary audio context per application session where practical.

Dispose of unused Tone.js instruments/samplers when appropriate.

---

# 36. VISUAL FEEDBACK

Every note interaction needs immediate visual feedback.

For example:

```text

User presses C

↓

C key visually activates

↓

Audio begins

↓

User releases C

↓

C key returns to normal

↓

Audio releases

```

The visual state must be synchronized with the actual interaction.

This is particularly important for keyboard control because users need to see what their physical keyboard is doing.

---

# 37. ACCESSIBILITY

Implement:

* Keyboard accessibility for UI controls

* Visible focus states

* Proper button labels

* ARIA labels where needed

* Sufficient contrast

* Reduced-motion support where possible

Do not confuse:

> keyboard instrument controls

with:

> accessibility keyboard navigation.

Both should coexist without interfering with each other.

---

# 38. ERROR HANDLING

Handle:

* Audio initialization failure

* Browser audio restrictions

* Sample loading failure

* Microphone permission denial

* Unsupported recording format

* Network failure

* Authentication failure

* Database failure

* Expired authentication session

Never silently fail.

Example:

Instead of:

> nothing happens

show:

> Audio couldn't be initialized. Click to enable audio.

---

# 39. DATABASE

Use Neon PostgreSQL.

Suggested tables:

```text

users

-----

id

email

password_hash

display_name

created_at

updated_at

recordings

----------

id

user_id

name

instrument

duration

bpm

events

audio_url

created_at

updated_at

user_preferences

----------------

id

user_id

default_instrument

default_tone

default_bpm

volume

created_at

updated_at

```

Use foreign keys.

Never store plaintext passwords.

Use migrations.

Store environment variables securely.

---

# 40. API

Create clean API boundaries.

Example:

```text

POST   /api/auth/signup

POST   /api/auth/login

POST   /api/auth/logout

GET    /api/auth/me

GET    /api/recordings

POST   /api/recordings

GET    /api/recordings/:id

DELETE /api/recordings/:id

GET    /api/preferences

PUT    /api/preferences

```

Do not create API endpoints for things that can remain entirely client-side.

Instrument playing itself should primarily happen client-side.

---

# 41. SECURITY

Implement:

* Password hashing

* Authentication validation

* Input validation

* Authorization checks

* Rate limiting where appropriate

* Secure cookies/token handling

* CORS configuration

* Environment variables

* SQL parameterization/ORM-safe queries

A user must never be able to retrieve another user's recordings by changing an ID in the URL.

---

# 42. NETLIFY DEPLOYMENT

The project must be deployment-ready.

Create:

```text

.env.example

```

with placeholders for:

```text

DATABASE_URL=

AUTH_SECRET=

```

Never commit real secrets.

Ensure:

* React frontend builds successfully

* API routes/deployment strategy works on Netlify

* SPA routing works after refreshing a nested route

* Production database connection works

* Audio assets are accessible in production

* Microphone permissions work under HTTPS

---

# 43. PERFORMANCE

Instrumento is an audio application.

Performance matters.

Prioritize:

1. Audio responsiveness

2. Input latency

3. Sample loading

4. Rendering performance

5. Visual animations

Avoid excessive React state updates for every audio sample or high-frequency audio operation.

Audio timing should remain inside the audio engine rather than depending on React render cycles.

---

# 44. DESIGN SYSTEM RULES

Once Figma is connected:

Extract and respect:

* Font family

* Font sizes

* Font weights

* Line heights

* Color tokens

* Spacing scale

* Border radii

* Shadows

* Icon style

* Button states

* Hover states

* Active states

* Disabled states

* Focus states

* Animation durations

Do not replace the Figma system with generic Tailwind defaults.

Create reusable design tokens.

---

# 45. MICRO-INTERACTIONS

Use animation intentionally.

Good examples:

* Piano key depresses when played

* Guitar string responds when plucked

* Drum responds to hit

* Recording indicator pulses

* Metronome visually indicates beat

* Tuner needle moves smoothly

* Controls provide tactile feedback

Avoid:

* Animating everything

* Constant floating effects

* Decorative gradients

* Excessive page transitions

---

# 46. FIRST-CLASS FUNCTIONALITY

The following are NOT optional polish items.

They must actually work:

### Piano

* [ ] Mouse play

* [ ] Keyboard play

* [ ] Note release

* [ ] Polyphony

* [ ] Tone switching

* [ ] Octave control

* [ ] Sustain

* [ ] Volume

* [ ] Metronome

* [ ] Recording

* [ ] Playback

### Guitar

* [ ] Mouse play

* [ ] Keyboard play

* [ ] Strings

* [ ] Frets

* [ ] Fret slider

* [ ] Acoustic mode

* [ ] Electric mode

* [ ] Volume

* [ ] Metronome

* [ ] Recording

* [ ] Playback

### Drums

* [ ] Kick

* [ ] Snare

* [ ] Hi-hat

* [ ] Tom

* [ ] Crash

* [ ] Mouse play

* [ ] Keyboard play

* [ ] Metronome

* [ ] Recording

* [ ] Playback

### Ukulele

* [ ] Four strings

* [ ] Frets

* [ ] Mouse play

* [ ] Keyboard play

* [ ] Basic strumming

* [ ] Volume

* [ ] Sustain/hold behavior where appropriate

* [ ] Metronome

* [ ] Recording

* [ ] Playback

### Tuners

* [ ] Guitar tuner

* [ ] Ukulele tuner

* [ ] Microphone permission

* [ ] Frequency detection

* [ ] Note detection

* [ ] Flat/in-tune/sharp indicator

* [ ] Error states

---

# 47. IMPLEMENTATION PRIORITY

Build in this order.

## Phase 1 — Foundation

* Project setup

* React

* Express

* Neon

* Authentication

* Routing

* Design tokens

* Figma inspection

## Phase 2 — Audio engine

* AudioContext

* Tone.js

* Master output

* Sample loading

* Instrument abstraction

## Phase 3 — Piano

Build the piano completely before cloning architecture to other instruments.

The piano must support:

* Mouse

* Keyboard

* Polyphony

* Samples

* Tone switching

* Sustain

* Metronome

* Recording

* Playback

## Phase 4 — Guitar

Reuse the audio/input architecture.

## Phase 5 — Drums

Use sample-based drum hits.

## Phase 6 — Ukulele

Reuse the guitar/fretted-instrument architecture.

## Phase 7 — Tuners

Implement microphone/frequency detection.

## Phase 8 — Saved recordings

Connect recordings to authenticated users and Neon.

## Phase 9 — Polish

* Responsive behavior

* Loading states

* Error states

* Accessibility

* Animations

* Performance

* Production testing

---

# 48. DO NOT OVERENGINEER THE FIRST VERSION

Do not attempt to build:

* Full DAW

* Music notation editor

* MIDI workstation

* Multiplayer jam sessions

* Social network

* AI music generation

* Complex effects rack

* Full 88-key physical simulation

* Realistic guitar physics

The first version should be:

> A beautiful, distinctive, genuinely playable browser instrument platform.

---

# 49. IMPORTANT ENGINEERING PRINCIPLE

Whenever there is a choice between:

**A)** beautiful graphics but fake functionality

and

**B)** simpler graphics but genuinely working audio/input/recording

choose **B**.

The product's value comes from interaction.

A simple piano that feels responsive is better than a photorealistic piano that doesn't play correctly.

---

# 50. DEFINITION OF DONE

Instrumento is not considered complete merely because:

* Pages render

* Buttons exist

* Animations work

* The UI resembles the Figma design

It is complete only when a user can:

1. Create an account.

2. Log in.

3. Enter Instrumento.

4. Open an instrument.

5. Hear the instrument.

6. Play using their mouse.

7. Play using their computer keyboard.

8. Change available instrument settings.

9. Use sustain where applicable.

10. Turn on a metronome.

11. Record a performance.

12. Play the recording back.

13. Save the recording when logged in.

14. Open a guitar/ukulele tuner.

15. Give microphone permission.

16. Tune an instrument and see meaningful pitch feedback.

17. Navigate the application without broken states.

18. Use the application after production deployment.

---

# 51. FINAL AGENT INSTRUCTION

Do not rush into implementation.

First:

1. Inspect the repository.

2. Inspect the connected Figma MCP.

3. Understand the existing design system.

4. Establish the application architecture.

5. Establish the audio architecture.

6. Decide which instrument samples will be used and verify their licenses.

7. Build the reusable audio/input/recording infrastructure.

8. Build the piano completely.

9. Test it thoroughly.

10. Reuse the architecture for guitar, drums, and ukulele.

11. Build the tuners.

12. Connect authentication and saved recordings.

13. Deploy to Netlify with Neon.

14. Test the production build.

If a feature cannot be implemented perfectly, implement the **simplest genuinely functional version** rather than creating a visual placeholder.

The final result should feel like a deliberately designed musical product—not an AI-generated template with musical instruments placed on top. , this was the plan, follow the implementation plan

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://tune-play-record.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3b33d909-a157-4faa-9937-d584ed905aaa).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

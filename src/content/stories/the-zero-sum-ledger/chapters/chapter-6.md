# Chapter 6 — The Final Settlement

The clock in the bottom corner of Arjun's ThinkPad read 08:44:12 AM.

Outside, the monsoon rain had eased into a heavy, suffocating mist that clung to the Dadar rooftops. Inside Flat 402, the tension was absolute.

Arjun's fingers moved across the keyboard with a quiet, deliberate rhythm. He wasn't typing fast out of panic; he was calibrating every line of C code like a watchmaker assembling a microscopic gear.

Fifteen minutes until market open.

Aegis Capital's internal risk desk had designed the ghost vault to be indestructible. The script was self-mutating, sandboxed behind high-priority telecom APIs, and hardcoded to execute its massive short-sell cascade at 08:59:58 AM. They had ensured no outside auditor, no security firewall, and no law enforcement agency could halt the execution sequence.

They were right. The code couldn't be stopped.

So Arjun didn't try to stop it. He built a payload known in high-frequency trading as a Header Mirror.

Instead of attacking Aegis's secure node, Arjun's script targeted the public Clearinghouse Synchronization Bridge—the neutral digital relay where all institutional trades must register before passing into the Reserve Bank's settlement engine.

Using the administrative API credentials he had extracted from Desk 04's VoIP stream, Arjun injected his C code into the bridge's buffer memory.

[PAYLOAD LOADED]: HEADER_MIRROR_V4.c
[TARGET BUFFER]: RBI_CLEARING_RELAY_09
[STATUS]: ARMED // WAITING FOR EXECUTION SIGNAL

His payload was completely invisible because it contained no malicious instructions. It didn't block packets, it didn't alter transaction amounts, and it didn't touch the stolen four-paisa pool.

It did only one thing: the instant Aegis's master script fired at 08:59:58 AM to dump the short options and claim the ghost vault, Arjun's Header Mirror would silently copy the entire cryptographic origin signature—including Desk 04's internal MAC addresses, local server serial numbers, and private encryption keys—and stitch that data directly into the public transaction ledger.

In institutional banking, a private ledger can be scrubbed. A public clearinghouse record, once validated by the central bank, is immutable. Permanent. Written in stone.

At 08:52:00 AM, Arjun's phone vibrated against the desk.

It was a direct call from the same unlisted, scrambled number. Arjun tapped the speakerphone button, keeping his eyes fixed on the terminal screen.

"Ten minutes, Vane," the calm, cultured voice from Desk 04 said through the speaker. The sound of rain at BKC hummed softly in the background. "Your cell tower access is still locked. Your primary machine is flagged. This is your last operational window to accept Option A. Take the four point two crore and walk away. Don't let your pride ruin your life."

Arjun didn't yell. He didn't mock him. His voice was completely flat, devoid of emotion.

"I looked at the code for your ghost vault," Arjun said softly.

A brief pause on the line. "And?"

"It's impressive," Arjun replied, checking his memory injection thread. "The way you used the micro-siphon to bypass compliance thresholds... it's clean. But you made the classic institutional mistake."

"Which is?"

"You assumed that because you own the pipe, you own the water," Arjun said. "You think money is just numbers on your private server. You forgot that at 09:00 AM, those numbers have to touch the central clearinghouse. And down here in the mud, we know how the clearinghouse reads headers."

The voice on the other end lost its polite, condescending warmth. "What did you do, Vane?"

"I didn't stop your script," Arjun said, tapping the ENTER key to lock his payload in place. "I gave it a mirror. When your trade executes in seven minutes, it won't look like a mysterious market crash or an anonymous hack. It will register as a direct, authorized short-manipulation order originating from Aegis Capital, Desk 04, BKC Tower B, Floor 14."

"You're bluffing," the man rasped, but the sound of his ceramic mug hitting his desk echoed sharply over the line. "If you alter those headers, the fraud signature we built against you—"

"—Will be completely irrelevant," Arjun interrupted coldly. "Because my script doesn't send the alert to the Economic Offences Wing or local police. It sends the mirrored cryptographic proof directly to the RBI Enforcement Directorate's automated freeze portal. The exact second your short orders hit the market, the central bank's fraud protocol will instantly freeze Aegis's entire primary clearing margin."

Silence hung on the line—heavy, suffocating, and absolute.

"You can't short three banks if your primary margin is frozen," Arjun added quietly. "The short cascade collapses before it starts. The regional banks stay solvent. And every rupee sitting in that ghost vault gets automatically impounded by the central bank as evidence."

"Vane—listen to me—"

Arjun hung up the call. He didn't block the number. He simply set the phone face down on his wooden desk.

08:59:50 AM

08:59:55 AM

08:59:58 AM

On his ThinkPad screen, a single green line flashed:

[EXECUTION DETECTED]: AEGIS_DESK_04 // TRIGGERED
[HEADER MIRROR ATTACHED]: SUCCESS
[RBI CLEARINGHOUSE RESPONSE]: MARGIN_FREEZE_NOTICE_ISSUED
[STATUS]: COMPLETE

Across the city in BKC, the trading floor of Aegis Capital Desk 04 descended into immediate, unmitigated chaos as every primary monitor flashed red, locking out their market-maker accounts.

In Dadar West, inside Flat 402, nothing made a sound.

The ghost vault was gone. The micro-siphon collapsed. The four-paisa leaks across four million accounts closed instantly as the central bank's safety protocols reset the legacy COBOL databases. The three regional banks were safe, their stock prices untouched as the morning market bell rang at 09:00 AM.

Arjun sat back in his wooden chair, letting out a long, slow breath.

He didn't receive ₹4.2 Crore. He didn't get his name in the newspapers or a public thank-you from the banks he had saved. To the rest of the world, nothing had happened at all—just another quiet rainy morning in Mumbai.

He closed the lid of his ThinkPad, pulled the USB drive from the port, and snapped it in half between his thumb and forefinger. He unplugged his rig, stood up, and stretched his stiff, aching back.

He grabbed his raincoat from the hook behind the door and stepped out of his apartment into the cool morning air, ready to grab a hot cup of tea from the corner stall.

The system was still rigged, and the city was still noisy. But as long as the engine ran in the dark, Arjun Vane was the one who held the key.

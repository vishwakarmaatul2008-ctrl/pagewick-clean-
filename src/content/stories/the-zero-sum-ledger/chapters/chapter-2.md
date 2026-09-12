# Chapter 2 — The Ghost Pipeline

Arjun's fingers flew across the worn keys, calling up a raw network monitoring socket.

He didn't query the bank's database; he queried the underlying packet movement at the network interface layer. If four paisa was moving against auditor privileges, it meant an active thread was holding that record open.

[COMMAND]: tcpdump -i eth0 -nn -X 'host 10.204.18.91 and port 8443'

Line after line of hex code streamed across his second monitor. Arjun narrowed the filter, tracking the exact memory address where the ₹0.04 debit had executed.

What he saw made his pulse quicken.

The single transaction wasn't an isolated event. It was part of an active, high-velocity loop. Every 180 seconds, a background daemon swept through the bank's core account database, selecting dormant retail savings accounts with balances under ₹5,000, and stripping precisely ₹0.04 from each.

"It's not a float error," Arjun whispered to the empty room. "It's a harvest."

He opened a secondary shell and launched a parallel query across four other regional institutions he audited: Konkan Mercantile Bank, Deccan Alliance, and Sahyadri Urban Co-operative.

The terminal output was relentless:

[QUERY MATCH]: KONKAN MERCANTILE // 1,024,110 ACCOUNTS // ₹0.04 DEBIT ACTIVE
[QUERY MATCH]: DECCAN ALLIANCE // 1,890,400 ACCOUNTS // ₹0.04 DEBIT ACTIVE
[QUERY MATCH]: SAHYADRI URBAN // 1,197,580 ACCOUNTS // ₹0.04 DEBIT ACTIVE

He ran the math in his head before pulling up a calculator terminal.

Four million accounts. Four paisa per account. That was ₹1,600,000—sixteen lakh rupees—drawn every three minutes. Over a twenty-four-hour window, the siphon was quietly draining over ₹7.6 Crore out of the retail banking system without raising a single automated compliance alert.

Why? Because no single account holder gets an SMS alert for a four-paisa debit. No fraud algorithm flags a transfer below fifty rupees. It was micro-volume stealth execution at scale.

Arjun initiated a deep trace to locate the destination vault where the harvested capital was aggregating. He injected an tracking string into the next outbound transaction block.

[INJECTING TRACE STRING...]
[PACKET HOP 1]: 102.164.12.8 (MUMBAI CLEARING SUB-NODE)
[PACKET HOP 2]: 185.220.101.5 (ENCRYPTED TUNNEL)
[PACKET HOP 3]: TARGET NODE IDENTIFIED...

Suddenly, his primary monitor flickered violently.

The scrolling terminal window collapsed into blackness. The cooling fans inside his custom tower rig spun up to maximum RPM, whining like a jet engine on a runway.

Arjun reached for the power switch, but before his fingers touched the toggle, his machine locked down completely. The command prompt vanished, replaced by a clean, stark white interface with a single black terminal window in the center.

[ALERT]: INTRUSION DETECTED ON NODE 104.28.19.12
[SOURCE MATCH]: FLAT 402, SHANTI TOWER, DADAR WEST

A cold drop of sweat rolled down Arjun's neck. They didn't just block his trace; they had traced him back through his local ISP infrastructure in under four seconds.

Before he could pull the Ethernet cable from the wall, the tiny, dark bezel at the top of his primary monitor clicked.

The hardware webcam indicator light—a tiny white LED that had been dark for two years—glowed a steady, unmistakable green.

A second later, his phone on the desk vibrated against the wooden surface.

A text message from an unlisted shortcode:

"You're out of your depth, Arjun. You have six hours before the Reserve Bank opens its clearing window. Shut down your scripts, ignore the anomaly, and you will receive a 50% allocation of the current vault—₹4.2 Crore—deposited to an offshore cold wallet at 09:00 AM. Interfere again, and we release your IP logs directly to the Economic Offences Wing with a pre-packaged fraud signature attached to your name."


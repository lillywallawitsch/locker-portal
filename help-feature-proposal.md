*Help chat in the Locker Portal* 💬

*What it is*
• A Help button built into every page of the portal
• Users can ask questions, report issues, or request changes without leaving the portal
• Goal: fewer manual support tickets

*Design decisions*
• Floating button (overview pages) + tab (detail pages) — always visible, no hidden shortcuts
• Labelled "Help" in plain text — accessible for non-digital-native users
• Detail data stays visible — users can still copy IDs/addresses while chatting
• Reuses existing panel and button components — no new patterns introduced

*How I trained the suggestions*
I went through the last few months of #ooh-ops tickets and pulled the most common issues. Those are now the default prompts users see when they open the chat:
• Parcel stuck / compartment won't open
• Pickup code not working
• Wrong data shown on platform
• Cancel a booking
• Locker offline or not on platform

*Status*
• Live on localhost + deployed to Vercel, all pages covered
• Code pushed to GitHub: github.com/lillywallawitsch/locker-portal
• Next step: connect to a backend that reads our docs and creates Jira tickets automatically

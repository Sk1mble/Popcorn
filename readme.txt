This module adds an icon to the Tokens menu (a lightning bolt). 
If you click on that icon a resizable pop-up window will appear. 
This window lists all of the tokens that have been entered into the currently selected combat encounter and which haven't acted yet.
It tracks which tokens have acted with a token flag (popcornHasActed) for persistance.
When the GM presses the Act button for a given token, it will disappear from the list until 'next exchange' is pressed.
This module does require an encounter to have been set up in the combat tracker, and displays the currently active Combat.

Known flaws/limitations:
* If you have a single token simultaneously enrolled in two combats on the same Scene, pressing 'act now' will confirm that it has acted for all combats in the scene.
* When you click the 'end conflict' button, Foundry will ask you if you're sure before clearing the combat tracker. However, this module will immediately mark all tokens as not having acted yet.
* This means that, if you click 'end conflict' and then change your mind, you will lose the 'has acted' status for all of the tokens in the encounter.

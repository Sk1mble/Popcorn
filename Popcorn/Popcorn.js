class PopcornViewer extends Application {
  super(options){
    console.log("Super called");
  }

  static prepareButtons(hudButtons){
    let hud = hudButtons.find(val => {return val.name == "token";})
    
    if (hud){
        hud.tools.push({
            name:"PopcornInitiative",
            title:"Pop-out popcorn initiative tracker",
            icon:"fas fa-bolt",
            onClick: ()=> {
              const delay = 200;

              let opt=Dialog.defaultOptions;
              opt.resizable=true;
              opt.title="Popcorn Initiative Tracker";
              opt.width=400;
              opt.height=500;
              opt.minimizable=true;
              
              var viewer;
              viewer = new PopcornViewer(opt);
              viewer.render(true);  

              Hooks.on('renderCombatTracker', () => {
                  setTimeout(function(){viewer.render(false);},delay);
              })

              Hooks.on('renderChatMessage', () => {
                  setTimeout(function(){viewer.render(false);},delay);
              })
            },
            button:true
        });
    }
  }

  getData (){
    let content={content:`${this.preparePopcorn()}`}
    return content;
} 

  preparePopcorn(){
    console.log("PreparePopcorn called");
    //Get a list of the active combatants
    if (game.combat!= null){ 
        var combatants = game.combat.combatants;
        var tokens = canvas.tokens.placeables;
        var tokenId;
        var viewer = viewer;

        let table=`<h1>Exchange ${game.combat.round}</h1><table border="1" cellspacing="0" cellpadding="4">`;

        //Create a header row
        let rows;
        if (game.user.isGM){
            rows=[`<tr><td style="background: black; color: white;"></td><td style="background: black; color: white;">Character</td><td style="background: black; color: white;">Act Now?</td>`];
        } else {
            rows = [`<tr><td style="background: black; color: white;"></td><td style="background: black; color: white;">Character</td>`];
        }
        //Create a row for each combatant with the correct flag
        for(var i=0;i<combatants.length;i++){
            tokenId = combatants[i].token._id;//This is the representative of a token in the combatants list.
            console.log(tokenId);
            //Now to find the token in the placeables layer that corresponds to this token.
            let foundToken = tokens.find(val => {return val.id == tokenId;})

            let hasActed = foundToken.getFlag("world","popcornHasActed");

            if (game.user.isGM) {
                if (hasActed == undefined || hasActed == false){
                rows.push(`<tr><td width="70"><img src="${foundToken.actor.img}" width="50" height="50"></img>
                </td><td>${foundToken.name}</td>
                <td><button type="button" name=${tokenId} onclick='
                
                tokens = canvas.tokens.placeables;
                for (let i = 0; i<tokens.length;i++){
                    if (tokens[i].id == this.name){
                        tokens[i].setFlag("world","popcornHasActed",true);
                        ChatMessage.create({content: "${tokens[i].name} has taken their action for the exchange.", speaker : { alias : "Game: "}})                            
                    }
                }
                '>Act</button></td></tr>`);
            }
            } else {
                if (hasActed == undefined || hasActed == false){
                    rows.push(`<tr><td width="70"><img src="${foundToken.actor.img}" width="50" height="50"></img></td><td>${foundToken.name}</td>`)
                }
            }
        }
        let myContents=`${table}`;
        rows.forEach(element => myContents+=element)
        myContents+="</table>"
        if (game.user.isGM){
            myContents+=`<button type ="button" onclick='
            let actors = canvas.tokens.placeables;
            actors.forEach(actor =>{actor.setFlag("world","popcornHasActed",false)});
            game.combat.nextRound();
            ChatMessage.create({content: "Starting a new exchange.", speaker : { alias : "Game: "}})
            '>Next Exchange</button><p>`
            myContents+=`<button type ="button" onclick='
            let actors = canvas.tokens.placeables;
            actors.forEach(actor =>{actor.setFlag("world","popcornHasActed",false)});
            game.combat.endCombat();
            ChatMessage.create({content: "Ending the conflict.", speaker : { alias : "Game: "}})
            '>End this conflict</button>`
        }
        return myContents;
    } else {return "<h1>No Conflicts Detected!</h1>"}
}

  // This function prepares the contents of the popcorn initiative viewer
  // Display the current exchange number
  // Display the actor icon of each combatant for which popcornHasActed is false or undefined.
  // Display the name of each combatant for which popcornHasActed is false or undefined.
  // Display a button that says 'act now'
  // At the end of the display of buttons etc. display a button that says 'next exchange'.

}

Hooks.on('getSceneControlButtons', function(hudButtons)
{
    PopcornViewer.prepareButtons(hudButtons);
})

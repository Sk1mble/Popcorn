class PopcornViewer extends Application {
  super(options) {}

  activateListeners(html) {
    super.activateListeners(html);
    const myButton = html.find("button[name='act']");
    myButton.on("click", event => this._onClickButton(event, html));
  }

  async _onClickButton(event, html) {
    const tokenId = event.target.id;
    const token = canvas.tokens.get(tokenId);
    
    await token.setFlag("world", "popcornHasActed", true);
    await ChatMessage.create({
      content: game.i18n.format(game.i18n.localize("Popcorn.IsActing"), {name: token.name}),
      speaker:
        {
          alias: game.i18n.localize("Popcorn.Game")
        }
      });
    game.socket.emit("module.Popcorn", {"HasActed": true});
    this.render(false);
  }

  static prepareButtons(hudButtons) {
    let hud = hudButtons.find(val => {return val.name == "token";})
    
    if (hud) {
        hud.tools.push({
          name: game.i18n.localize("Popcorn.ButtonName"),
          title: game.i18n.localize("Popcorn.ButtonHint"),
          icon: "fas fa-bolt",
          onClick: () => {
            const delay = 200;

            let opt = Dialog.defaultOptions;
            opt.resizable = true;
            opt.title = game.i18n.localize("Popcorn.WindowTitle");
            opt.width = 400;
            opt.height = 500;
            opt.minimizable = true;
            
            var viewer;
            viewer = new PopcornViewer(opt);
            viewer.render(true);  

            game.system.popcorn = viewer;
            game.socket.on("module.Popcorn", data => viewer.render(false))
          },
          button:true
        });
    }
  }

  getData() {
    let content = {content: `${this.preparePopcorn()}`}
    return content;
  }


  // This function prepares the contents of the popcorn initiative viewer
  // Display the current exchange number
  // Display the actor icon of each combatant for which popcornHasActed is false or undefined.
  // Display the name of each combatant for which popcornHasActed is false or undefined.
  // Display a button that says 'act now'
  // At the end of the display of buttons etc. display a button that says 'next exchange'.
  preparePopcorn() {
    //console.log("PreparePopcorn called");
    //Get a list of the active combatants
    if (game.combat != null) {
        var combatants = game.combat.combatants;
        var tokens = canvas.tokens.placeables;
        var tokenId;
        var viewer = viewer;

        //Create a header row
        let s_exchange = game.i18n.format(game.i18n.localize("Popcorn.Exchange"), {round: game.combat.round});
        let table = `${s_exchange}<table style="border: none">`;

        //Create a row for each combatant with the correct flag
        let rows;
        let s_character = game.i18n.localize("Popcorn.Character");
        let s_actnow = game.i18n.localize("Popcorn.ActNow");
        if (game.user.isGM){
          rows = [`<tr>
          <td style="background: black; color: white;"></td>
          <td style="background: black; color: white; text-align: center; padding: 3px">${s_character}</td>
          <td style="background: black; color: white; text-align: center; padding: 3px">${s_actnow}</td>
          </tr>`];
        } else {
          rows = [`<tr>
          <td style="background: black; color: white;"></td>
          <td style="background: black; color: white; text-align: center; padding: 3px">${s_character}</td>
          </tr>`];
        }

        let s_act = game.i18n.localize("Popcorn.Act");
        for(var i = 0; i < combatants.length; i++) {

          if (combatants[i].token != undefined) {
            // This is the representative of a token in the combatants list.
            tokenId = combatants[i].token._id;
          }
          // Now to find the token in the placeables layer that corresponds to this token.
          let foundToken = undefined;
          if (tokenId != undefined) {
            foundToken = tokens.find(val => {return val.id == tokenId;})
          }
          if (foundToken == undefined){
            return;
          }
          if ((combatants[i].hidden || foundToken.data.hidden) && !game.user.isGM){
            continue;
          }

          let hasActed = undefined;
          if (foundToken != undefined) {
            // There is no token for this actor in the conflict; it probably means the token has been deleted from the scene. We need to ignore this actor. Easiest way to do that is to leave hasActed as true.
            hasActed = foundToken.getFlag("world", "popcornHasActed");
          } 
          
          if (hasActed == undefined || hasActed == false) {
            if (game.user.isGM) {
              rows.push(`<tr>
                <td style="width: 60px; height: 60px; padding: 5px">
                  <img src="${foundToken.actor.img}" width="50px" height="50px"></img>
                </td>
                <td style="padding-left: 15px">${foundToken.name}</td>
                <td style="width: 120px; padding: 5px">
                  <button type="button" id="${tokenId}" name="act" onclick='' style="width: 105px">${s_act}</button>
                </td>
                </tr>`);
            } else {
              rows.push(`<tr>
                <td style="width: 60px; height: 60px; padding: 5px">
                  <img src="${foundToken.actor.img}" width="50px" height="50px"></img>
                </td>
                <td style="padding-left: 15px">${foundToken.name}</td>
                </tr>`)
            }
          }
        }

        let myContents = `${table}`;
        rows.forEach(element => myContents += element)
        myContents += "</table>"

        let s_newexchange = game.i18n.localize("Popcorn.NewExchange");
        let s_game = game.i18n.localize("Popcorn.Game");
        let s_nextexchange = game.i18n.localize("Popcorn.NextExchange");
        let s_endingconflict = game.i18n.localize("Popcorn.EndingConflict");
        let s_endconflict = game.i18n.localize("Popcorn.EndConflict");

        if (game.user.isGM){

          myContents += `<p><button type="button" onclick='
          let actors = canvas.tokens.placeables;
            let updates = actors.map(actor => {
                            let update = {};
                            console.log(actor)
                            update._id = actor.id;
                            update.flags = {
                                                "world":
                                                {
                                                    "popcornHasActed":false
                                                }
                                            }        
                                    return update;
                            })
          game.scenes.viewed.updateEmbeddedEntity("Token", updates);
          game.combat.nextRound();
          ChatMessage.create({content: "${s_newexchange}", speaker: { alias: "${s_game}"}})
          '>${s_nextexchange}</button></p>`

          myContents += `<p><button type="button" onclick='
          let actors = canvas.tokens.placeables;
            let updates = actors.map(actor => {
                            let update = {};
                            update._id = actor.id;
                            update.flags = {
                                                "world":
                                                {
                                                    "popcornHasActed":false
                                                }
                                            }        
                                    return update;
                            })
          game.scenes.viewed.updateEmbeddedEntity("Token", updates);
          game.combat.endCombat();
          ChatMessage.create({content: "${s_endingconflict}", speaker: { alias: "${s_game}"}})
          '>${s_endconflict}</button></p>`
        }
        return myContents;

    } else {
      return game.i18n.localize("Popcorn.NoConflicts");
    }
  }
}

Hooks.on('getSceneControlButtons', (hudButtons) => {
  PopcornViewer.prepareButtons(hudButtons);
})

Hooks.on('renderCombatTracker', () => {
  if (game.system.popcorn != undefined)
    setTimeout(function() { game.system.popcorn.render(false); }, 50);
})

Hooks.on('updateToken', (scene, token, data) => {
  if (game.system.popcorn != undefined && data.hidden != undefined)
    setTimeout(function() { game.system.popcorn.render(false); }, 50);
})

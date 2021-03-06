
$(document).ready(function name(params) {
    App.initWeb3();
    var resultShowed = false;
    var selected = [];
    App.contractInstance.getPokemonsByOwner.call(App.myAccount, function (error, results) {
        if (!error) {
            console.log("Your pokemons: " + results);
            var row = $(".pokemonList");
            if (results.length == 1) {
                results = [results];
            }
            for (let i = 0; i < results.length; i++) {
                var pokemon_template = $('.pokemonHolder').clone();
                pokemon_template.find(".card").attr("class", "card border-primary pokemon_" + results[i].toString());
                row.append(pokemon_template.clone().html());

                App.contractInstance.getPokemonInfo.call(results[i], function (error, info) {
                    if (!error) {
                        console.log(info);

                        $(".pokemon_" + results[i]).find(".card-title").text(info[1] + " " + info[5]);
                        $(".pokemon_" + results[i]).find("img").attr("src", "https://img.pokemondb.net/artwork/" + info[1] + ".jpg");
                    }
                    else {
                        console.log(error);

                    }
                })
            }

        }
        else {
            console.log(error);

        }

    })

    $(document).on("click", ".card", function () {
        var opacity = $(this).find(".attack-overlay").css("opacity");
        var id = $(this).attr("class").split(" ")[2].split("_")[1];
        
        if (opacity != 1 && selected.length < 2) {
            selected.push(id);
            console.log(opacity, "Selected: " + selected);
            $(this).find(".attack-overlay").attr("style", "opacity: 1");
            $(this).find(".attack-overlay").find("i").attr("class", "fas fa-7x fa-check-circle");
        }
        else{
            var index = selected.indexOf(id);
            console.log(index);
            
            if (index > -1){
                selected.splice(index, 1);
                console.log(opacity, "Selected: " + selected);
                $(this).find(".attack-overlay").attr("style", "opacity: 0");
                $(this).find(".attack-overlay").find("i").attr("class", "far fa-7x fa-check-circle");
            }
        }
    })

    App.showBattleResult = function (id1, id2, sp1, _hp1, sp2, _hp2, turns) {
        var mod;
        var turns_1 = [];
        var turns_2 = [];
        var hp1 = _hp1;
        var hp2 = _hp2;
        if (parseInt(sp1) >= parseInt(sp2)) {
            mod = 0;
            $(".a-b").attr("style", "color: red");
        }
        else{
            mod = 1;
            $(".b-a").attr("style", "color: red");
        }
        
        App.contractInstance.getPokemonInfo.call(id1, (err1, res1) => {
            App.contractInstance.getPokemonInfo.call(id2, (err1, res2) => {
                $(".a-b").text(res1[1] + "->" + res2[1])
                $(".b-a").text(res2[1] + "->" + res1[1])
            })
        })


        console.log("HP1 " + hp1 + " SP1: " + sp1);
        console.log("HP2 " + hp2 + " SP2: " + sp2);
        console.log(turns);
        
        for (let i = 0; i < turns.length; i++) {
            
            if (i % 2 == mod) {
                if (turns[i]['c'][0] == 0) {
                    console.log("Pokemon 1 has missed!");
                    turns_1.push("miss");
                }
                else{
                    hp2 -= turns[i]['c'][0];
                    console.log("Pokemon 1 just hit and caused " + turns[i]['c'][0] + " damage!");
                    turns_1.push(-turns[i]['c'][0]);
                    if (hp2 <= 0) {
                        console.log("Pokemon 2 has fainted!");
                        break;
                    }
                }
            }
            else{
                if (turns[i]['c'][0] == 0) {
                    console.log("Pokemon 2 has missed!");
                    turns_2.push("miss");
                }
                else {
                    hp1 -= turns[i]['c'][0];
                    turns_2.push(-turns[i]['c'][0])
                    console.log("Pokemon 1 just hit and caused " + turns[i]['c'][0] + " damage!");
                    if (hp1 <= 0) {
                        console.log("Pokemon 1 has fainted!");
                        break;
                    }
                }
            }    
        }

        $(".battle-result").attr("style", "width:18em; display: block; margin-left: auto; margin-right: auto; border: 1px solid black");
        $(".battle-reuslt").find('tbody').children().remove();
        $(".battle-result").find('tbody').append("<tr><td>0</td ><td>" + _hp2 + "</td><td>" + _hp1 + "</td></tr >")
        for(let i = 0; i < Math.max(turns_1.length, turns_2.length); i++){
            if (i >= turns_1.length){
                $(".battle-result").find('tbody').append("<tr><td>" + (i+1) + "</td ><td>" + "death" + "</td><td>" + turns_2[i] + "</td></tr >")
            }
            else if (i >= turns_2.length){
                $(".battle-result").find('tbody').append("<tr><td>" + (i+1) + "</td ><td>" + turns_1[i] + "</td><td>" + "death" + "</td></tr >")
            }
            else{
                $(".battle-result").find('tbody').append("<tr><td>" + (i+1) + "</td ><td>" + turns_1[i] + "</td><td>" + turns_2[i] + "</td></tr >")
            }
        }

        if (turns_1.length == turns_2.length){
            if (hp1 == 0){
                $(".battle-result").find('tbody').append("<tr><td>" + (turns_1.length + 1) + "</td ><td></td><td>death</td></tr >")                
            }
            else {
                $(".battle-result").find('tbody').append("<tr><td>" + (turns_1.length + 1) + "</td ><td>" + "death" + "</td><td></td></tr >")
            }
        }

        resultShowed = true;
    }

    $(document).on("click", ".btn", function () {
        if(selected.length < 2) {
            return
        }
        console.log(selected);
        

        App.contractInstance.getPokemonInfo.call(parseInt(selected[0]), function (error, info) {
            if (!error) {
                console.log(info);

                $(".mypokemon").find(".card-title").text(info[0] + " (" + info[1] + ")");
                $(".mypokemon").find(".level").text(info[5]);
                $(".mypokemon").find("img").attr("src", "https://img.pokemondb.net/artwork/" + info[1] + ".jpg");
            }
            else {
                console.log(error);

            }
        })

        App.contractInstance.getPokemonInfo.call(parseInt(selected[1]), function (error, info) {
            if (!error) {
                console.log(info);

                $(".enemy").find(".card-title").text(info[0] + " (" + info[1] + ")");
                $(".enemy").find(".level").text(info[5]);
                $(".enemy").find("img").attr("src", "https://img.pokemondb.net/artwork/" + info[1] + ".jpg");
            }
            else {
                console.log(error);

            }
        })

        App.contractInstance.getPokemonStats.call(parseInt(selected[0]), (error, stats1) => {
            if (!error) {
                $(".mypokemon").find(".attack").text(stats1[0]);
                $(".mypokemon").find(".defense").text(stats1[1]);
                $(".mypokemon").find(".speed").text(stats1[2]);
                $(".mypokemon").find(".hp").text(stats1[3]);
            }
            else{
                console.log(error);
                
            }
        })

        App.contractInstance.getPokemonStats.call(parseInt(selected[1]), (error, stats2) => {
            if (!error) {
                $(".enemy").find(".attack").text(stats2[0]);
                $(".enemy").find(".defense").text(stats2[1]);
                $(".enemy").find(".speed").text(stats2[2]);
                $(".enemy").find(".hp").text(stats2[3]);
            }
            else{
                console.log(error);
                
            }
        })

        $(".pokemon-row").css("visibility", "visible");

        resultShowed = false;
        App.contractInstance.attack(parseInt(selected[0]), parseInt(selected[1]), {
            gas: 400000,
            from: App.myAccount,
            value: web3.toWei(0, 'ether')
        }, (err, res) => {
            if (!err) {
                console.log(res);
                var pokemonBattleEvent = App.contractInstance.PokemonBattle();

                pokemonBattleEvent.watch((err, res) => {
                    console.log("Battle: " + res.args._id1 + " vs " + res.args._id2);
                    App.contractInstance.getPokemonStats.call(res.args._id1, (err, stats1) => {
                        var sp1 = stats1[2];
                        var hp1 = stats1[3];
                        App.contractInstance.getPokemonStats.call(res.args._id2, (err, stats2) => {
                            var sp2 = stats2[2];
                            var hp2 = stats2[3];
                            if (! resultShowed){
                                App.showBattleResult(res.args._id1, res.args._id2, sp1, hp1, sp2, hp2, res.args.turns);
                            }
                        })
                    })
                })
                
            }
            else{
                console.log(err);
                
            }
        })
    })
    

})
// Si le code contient des erreurs il ne s'execute pas
try {
    // Definitions des modules
    const fs = require('fs')
    const sha1 = require('sha1')
    const $ = require('jquery')
    const { app } = require('electron')

    // Fonction qui permet d'ajouter des utilisateurs
    function addUser() {

        // Definition des variables du formulaire
        var name = document.getElementById('name').value
        var email = document.getElementById('email').value
        var password = sha1(document.getElementById('password').value)
        var cpassword = sha1(document.getElementById('cpassword').value)

        // Si les mots de passes sont pareils
        if (password == cpassword) {
            
            // On lit et on recupère le le fichier d'utilisateurs -> on fait une fonction qui prend en paramettre (err) et (data)
            fs.readFile('./ressources/auth/users.json', function (err, data) {
                
                // Si il y a une erreur on l'affiche
                if (err) throw err
                else {

                    // On fait une variable qui met dans un tableau les données du fichier utilisateus
                    const file = JSON.parse(data)
                    
                    // On verifie que l'utilisateur n'existe pas déjà
                    var result = file.users.filter(usr => {
                        return usr.password === password && usr.email === email
                    })
                    
                    // On fait une variable avec toutes les données qu'on souhaite insérer
                    const user_push = {
                        "id": file.users.length + 1,
                        "name": name,
                        "email":  email,
                        "password": password
                    }

                    // Si l'utilisateur existe déjà
                    if (result == user_push) {
                        console.log('user already exist')
                    }
                    else {

                        // On insère l'utilisateur dans la variable utilisateurs
                        file.users.push(user_push)
                        
                        // Met dans le format JSON
                        const json = JSON.stringify(file, null, "\t")
                        
                        // On ecris la variable JSON sur le fichier des utilisateurs
                        fs.writeFile('./ressources/auth/users.json', json, function (err) {
                            if (err) throw err
                        })
                        
                        // On informe que l'utilisateur est enregistrer
                        console.log('user is added')

                        // On definit des variables de sessions avec les informations de l'utilisateur
                        var user = {
                            "id": user_push.id,
                            "name": user_push.name,
                            "email": user_push.email,
                            "password": sha1(user_push.password)
                        }
                        sessionStorage.setItem("user", JSON.stringify(user))

                        // sessionStorage.setItem('user-id', user_push.id)
                        // sessionStorage.setItem('user-name', user_push.name)
                        // sessionStorage.setItem('user-email', user_push.email)
                        // sessionStorage.setItem('user-password', sha1(user_push.password))
                        
                        // On definit le statut 'Connecté'
                        sessionStorage.setItem('user-state', 'connected')

                        // On redirige vers la page index
                        window.location.href = "../index.html"
                    }
                }
            })
        }
    }

    // Fonction qui permet de se coonnecter
    function connect() {

        // On definit des variables du formulaire
        var email = document.getElementById('email').value
        var password = sha1(document.getElementById('password').value)

        // On recupere la liste des utlisateurs et on fait un fonction qui prend en paramètre (err) et (data)
        fs.readFile('./ressources/auth/users.json', function(err, data) {
            
            // Si il y a une erreur on l'affiche
            if (err) throw err
            else {
            
                // On fait une variable qui met dans un tableau les données du fichier utilisateus
                const file = JSON.parse(data)

                // On verifie que l'utilisateur n'existe pas déjà
                var result = file.users.filter(usr => {
                    return usr.password === password && usr.email === email
                })
                
                // On fait une variable avec la longueur des caractères du resultat de la verification
                let emptyArray = result.length

                // Si la longueur du resultat est égale à 0 on dis aue l'utilisateur est introuvable
                if (emptyArray === 0) {
                    console.log("user not found");
                }
                else {

                    // L'utilisateur est connecté
                    console.log("user conncted");

                    // On definit le statut 'Connecté'
                    sessionStorage.setItem('user-state', 'connected')

                    // On cherche dans le tableau les objets du resultat de la recherche de l'utilisateur
                    r2 = result.find(usr => {
                        return usr.email === email
                    })

                    // On definit des variables de sessions avec les informations de l'utilisateur
                    var user = {
                        "id": r2.id,
                        "name": r2.name,
                        "email": r2.email,
                        "password": r2.password
                    }
                    sessionStorage.setItem("user", JSON.stringify(user))

                    // sessionStorage.setItem('user-id', r2.id)
                    // sessionStorage.setItem('user-name', r2.name)
                    // sessionStorage.setItem('user-email', r2.email)
                    // sessionStorage.setItem('user-password', sha1(r2.password))

                    // On redirige vers la page index
                    window.location.href = "../index.html"
                }

            }
        })
    }

    function disconnect() {
        if (sessionStorage.getItem('user-state') == 'connected') {   
            sessionStorage.setItem('user-state', 'not-connected')
            
            sessionStorage.removeItem('user-id')
            sessionStorage.removeItem('user-name')
            sessionStorage.removeItem('user-email')
            sessionStorage.removeItem('user-password')
            
            window.location.href = "../index.html"
        }
        else {
            window.location.href = "../index.html"
        }
    }
}
catch (err) {
    console.log(err);
}
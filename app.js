let recipes = [];
let commands = [];

// Fonction pour ajouter une nouvelle recette
function addRecipe() {
    // Récupération des éléments d'entrée du formulaire
    const recipeInput = document.getElementById('recipeInput');
    const ingredientsInput = document.getElementById('ingredientsInput');

    // Extraction des valeurs des champs
    const recipeName = recipeInput.value.trim();
    const ingredients = ingredientsInput.value.trim();

    // Vérification si les champs ne sont pas vides
    if (recipeName !== '' && ingredients !== '') {
        // Génération d'un identifiant unique pour la recette
        const recipeId = Date.now().toString();

        // Ajout de la recette à la liste
        recipes.push({ name: recipeName, ingredients, id: recipeId });

        // Effacement des champs du formulaire
        recipeInput.value = '';
        ingredientsInput.value = '';

        // Mise à jour de l'affichage des recettes
        renderRecipes();
    } else {
        // Alerte si l'un des champs est vide
        alert('Veuillez saisir le nom de la recette et les ingrédients.');
    }
}

// Fonction pour supprimer une recette
function deleteRecipe(recipeId) {
    // Recherche de l'index de la recette dans le tableau
    const recipeIndex = recipes.findIndex(recipe => recipe.id === recipeId);

    // Vérification si la recette a été trouvée
    if (recipeIndex !== -1) {
        // Suppression de la recette du tableau
        recipes.splice(recipeIndex, 1);

        // Filtrage des commandes liées à la recette supprimée
        commands = commands.filter(command => command.recipe.id !== recipeId);

        // Mise à jour de l'affichage des recettes et des commandes
        renderRecipes();
        renderCommandsList();
    }
}

// Fonction pour passer une commande
async function placeOrder(recipeId) {
    // Recherche de la recette sélectionnée
    const selectedRecipe = recipes.find(recipe => recipe.id === recipeId);

    // Récupération de la sauce sélectionnée depuis le menu déroulant
    const saucesDropdown = document.getElementById(`sauces-${recipeId}`);
    const selectedSauce = saucesDropdown.value;

    // Vérification si une sauce a été sélectionnée
    if (selectedSauce === '') {
        // Alerte si aucune sauce n'est sélectionnée
        alert('Veuillez sélectionner une sauce avant de commander.');
        return;
    }

    try {
        // Récupération de l'heure actuelle à Paris
        const orderDate = await getParisTime();
        const formattedOrderDate = orderDate.toISOString();

        // Ajout de la commande à la liste des commandes
        commands.push({
            recipe: selectedRecipe,
            date: formattedOrderDate,
            sauce: selectedSauce,
        });

        // Tri des commandes par date décroissante
        commands.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Mise à jour de l'affichage des commandes
        renderCommandsList();
    } catch (error) {
        // Gestion des erreurs liées à la récupération de l'heure actuelle
        console.error('Erreur lors de la récupération de l\'heure actuelle :', error);
    }
}

// Fonction pour récupérer l'heure actuelle à Paris à partir de l'API WorldTime
async function getParisTime() {
    const response = await fetch('https://worldtimeapi.org/api/timezone/Europe/Paris');
    const data = await response.json();
    return new Date(data.utc_datetime);
}

// Fonction pour mettre à jour l'affichage des recettes et des plats
function renderRecipes() {
    renderRecipeList();
    renderOurPlatesList();
}

// Fonction pour mettre à jour l'affichage de la liste des recettes
function renderRecipeList() {
    // Sélection de l'élément HTML pour la liste des recettes
    const recipeList = document.getElementById('recipeList');

    // Remise à zéro du contenu de la liste
    recipeList.innerHTML = 'Liste des recettes :<br>';

    // Boucle sur chaque recette pour afficher dans la liste
    recipes.forEach((recipe) => {
        // Création d'un élément de liste avec le nom de la recette et les ingrédients
        const li = createListItem(`${recipe.name} - Ingrédients: ${recipe.ingredients}`);

        // Création d'un bouton pour supprimer la recette
        const deleteButton = createButton('Supprimer', () => deleteRecipe(recipe.id));

        // Ajout du bouton à l'élément de liste
        li.appendChild(deleteButton);

        // Ajout de l'élément de liste à la liste des recettes
        recipeList.appendChild(li);
    });
}

// Fonction pour mettre à jour l'affichage de la liste des plats disponibles
function renderOurPlatesList() {
    // Sélection de l'élément HTML pour la liste des plats
    const ourPlatesList = document.getElementById('ourPlatesList');

    // Remise à zéro du contenu de la liste
    ourPlatesList.innerHTML = 'Nos Plats :<br>';

    // Boucle sur chaque recette pour afficher dans la liste des plats
    recipes.forEach((recipe) => {
        // Création d'un élément de liste avec le nom de la recette et les ingrédients
        const li = createListItem(`${recipe.name} - Ingrédients: ${recipe.ingredients}`);

        // Création d'un menu déroulant pour les sauces
        const saucesDropdown = createSaucesDropdown(recipe.id);

        // Création d'un bouton pour commander la recette
        const orderButton = createButton('Commander', () => placeOrder(recipe.id));
        
        // Ajout du menu déroulant et du bouton à l'élément de liste
        li.appendChild(saucesDropdown);
        li.appendChild(orderButton);

        // Ajout de l'élément de liste à la liste des plats
        ourPlatesList.appendChild(li);
    });
}

// Fonction pour créer un menu déroulant des sauces pour une recette spécifique
function createSaucesDropdown(recipeId) {
    const saucesDropdown = document.createElement('select');
    saucesDropdown.id = `sauces-${recipeId}`;

    // Ajout de l'option par défaut
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.text = 'Sélectionner une sauce';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    saucesDropdown.appendChild(defaultOption);

    // Ajout des options pour chaque type de sauce
    const sauces = ['Ketchup', 'Algérienne', 'Blanche'];
    sauces.forEach((sauce) => {
        const option = document.createElement('option');
        option.value = sauce;
        option.text = sauce;
        saucesDropdown.appendChild(option);
    });

    return saucesDropdown;
}

// Fonction pour mettre à jour l'affichage de la liste des commandes
function renderCommandsList() {
    // Sélection de l'élément HTML pour la liste des commandes
    const commandsList = document.getElementById('commandsList');

    // Remise à zéro du contenu de la liste
    commandsList.innerHTML = 'Liste des commandes :<br>';

    // Tri des commandes par date croissante
    commands.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Boucle sur chaque commande pour afficher dans la liste
    commands.forEach((command, index) => {
        // Création d'un élément de liste avec le texte de la commande
        const commandItem = createListItem(formatCommandText(command));

        // Ajout de l'élément de liste à la liste des commandes
        commandsList.appendChild(commandItem);

        // Création d'un timer pour afficher le temps restant avant la validation
        const timer = createTimer(command.date, index);

        // Ajout du timer à la liste des commandes
        commandsList.appendChild(timer);

        // Création d'un bouton de validation pour la commande
        const validateButton = createButton('Valider', () => validateCommand(index));

        // Ajout du bouton de validation à la liste des commandes
        commandsList.appendChild(validateButton);
    });
}

// Fonction pour valider une commande et la retirer de la liste
function validateCommand(commandIndex) {
    // Suppression de la commande du tableau
    commands.splice(commandIndex, 1);

    // Mise à jour de l'affichage des commandes
    renderCommandsList();
}

// Fonction pour créer un élément de liste avec un texte donné
function createListItem(text) {
    const li = document.createElement('li');
    li.textContent = text;
    return li;
}

// Fonction pour créer un bouton avec un texte donné et un gestionnaire de clic
function createButton(text, clickHandler) {
    const button = document.createElement('button');
    button.textContent = text;
    button.onclick = clickHandler;
    button.id = `button-${Date.now()}`;
    return button;
}

// Fonction pour formater le texte d'une commande
function formatCommandText(command) {
    const date = new Date(command.date);
    const formattedDate = `${date.getHours()}:${padZero(date.getMinutes())}:${padZero(date.getSeconds())}`;
    return `${command.recipe.name} - ${formattedDate} - Sauce: ${command.sauce}`;
}

// Fonction pour ajouter un zéro devant les nombres < 10
function padZero(number) {
    return number < 10 ? `0${number}` : `${number}`;
}

// Fonction pour créer un timer avec le temps restant avant la validation
function createTimer(orderDate, index) {
    const timer = document.createElement('span');
    const targetTime = new Date(orderDate).getTime() + 10 * 60 * 1000;
    setInterval(() => updateTimer(timer, targetTime), 1000);
    return timer;
}

// Fonction pour mettre à jour le texte du timer
function updateTimer(timer, targetTime) {
    const currentTime = new Date().getTime();
    const remainingTime = targetTime - currentTime;

    if (remainingTime > 0) {
        const remainingMinutes = Math.floor(remainingTime / 60000);
        const remainingSeconds = Math.floor((remainingTime % 60000) / 1000);
        const formattedTime = `${padZero(remainingMinutes)}:${padZero(remainingSeconds)}`;
        timer.textContent = ` - ${formattedTime}`;
   
    } else {
        timer.textContent = ' - Temps écoulé';
    }
}

renderRecipes();
renderCommandsList();
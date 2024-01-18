let recipes = [];
let commands = [];

function addRecipe() {
    const recipeInput = document.getElementById('recipeInput');
    const ingredientsInput = document.getElementById('ingredientsInput');
    const recipeName = recipeInput.value.trim();
    const ingredients = ingredientsInput.value.trim();

    if (recipeName !== '') {
        const recipeId = Date.now().toString();
        recipes.push({ name: recipeName, ingredients, id: recipeId });
        recipeInput.value = '';
        ingredientsInput.value = '';
        renderRecipes();
    }
}

function deleteRecipe(recipeId) {
    const recipeIndex = recipes.findIndex(recipe => recipe.id === recipeId);

    if (recipeIndex !== -1) {
        recipes.splice(recipeIndex, 1);
        commands = commands.filter(command => command.recipe.id !== recipeId);

        renderRecipes();
        renderCommandsList();
    }
}

async function placeOrder(recipeId) {
    const selectedRecipe = recipes.find(recipe => recipe.id === recipeId);

    try {
        const orderDate = await getParisTime();
        const formattedOrderDate = orderDate.toISOString();

        commands.push({
            recipe: selectedRecipe,
            date: formattedOrderDate,
        });

        commands.sort((a, b) => new Date(b.date) - new Date(a.date));
        renderCommandsList();
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'heure actuelle :', error);
    }
}

async function getParisTime() {
    const response = await fetch('https://worldtimeapi.org/api/timezone/Europe/Paris');
    const data = await response.json();
    return new Date(data.utc_datetime);
}

function renderRecipes() {
    renderRecipeList();
    renderOurPlatesList();
}

function renderRecipeList() {
    const recipeList = document.getElementById('recipeList');
    recipeList.innerHTML = 'Liste des recettes :<br>';

    recipes.forEach((recipe) => {
        const li = createListItem(`${recipe.name} - Ingrédients: ${recipe.ingredients}`);
        const deleteButton = createButton('Supprimer', () => deleteRecipe(recipe.id));

        li.appendChild(deleteButton);
        recipeList.appendChild(li);
    });
}

function renderOurPlatesList() {
    const ourPlatesList = document.getElementById('ourPlatesList');
    ourPlatesList.innerHTML = 'Nos Plats :<br>';

    recipes.forEach((recipe) => {
        const li = createListItem(`${recipe.name} - Ingrédients: ${recipe.ingredients}`);
        const orderButton = createButton('Commander', () => placeOrder(recipe.id));

        li.appendChild(orderButton);
        ourPlatesList.appendChild(li);
    });
}

function renderCommandsList() {
    const commandsList = document.getElementById('commandsList');
    commandsList.innerHTML = 'Liste des commandes :<br>';

    commands.sort((a, b) => new Date(a.date) - new Date(b.date));

    commands.forEach((command, index) => {
        const commandItem = createListItem(formatCommandText(command));
        commandsList.appendChild(commandItem);
        const timer = createTimer(command.date, index);
        commandsList.appendChild(timer);
        const validateButton = createButton('Valider', () => validateCommand(index));
        commandsList.appendChild(validateButton);
    });
}


function validateCommand(commandIndex) {
    commands.splice(commandIndex, 1);
    renderCommandsList();
}

function createListItem(text) {
    const li = document.createElement('li');
    li.textContent = text;
    return li;
}

function createButton(text, clickHandler) {
    const button = document.createElement('button');
    button.textContent = text;
    button.onclick = clickHandler;
    button.id = `button-${Date.now()}`;
    return button;
}

function formatCommandText(command) {
    const date = new Date(command.date);
    const formattedDate = `${date.getHours()}:${padZero(date.getMinutes())}:${padZero(date.getSeconds())}`;
    return `${command.recipe.name} - ${formattedDate}`;
}

function padZero(number) {
    return number < 10 ? `0${number}` : `${number}`;
}

function createTimer(orderDate, index) {
    const timer = document.createElement('span');
    const targetTime = new Date(orderDate).getTime() + 10 * 60 * 1000;
    setInterval(() => updateTimer(timer, targetTime), 1000);
    return timer;
}

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
class calorieTracker{
    constructor(){
        this._calorieLimit = Storage.getCalorieLimit();
        this._totalCalories = Storage.getTotalCalories();
        this._meals = Storage.getMeals();
        this._workouts = Storage.getWorkouts();

        this._displayCaloriesLimit();
        this._renderStats();
    }

    // public methods

    addMeal(meal){
        this._meals.push(meal);
        this._totalCalories += meal.calorie;

        Storage.updateTotalCalories(this._totalCalories);
        Storage.saveMeal(meal);

        this._displayNewMeal(meal);
        this._renderStats();
    }

    removeMeal(id){
        const indexOfMeal = this._meals.findIndex(meal => meal.id === id);
        const meal = this._meals[indexOfMeal];

        this._totalCalories -= meal.calorie;

        this._meals.splice(indexOfMeal, 1);

        Storage.updateTotalCalories(this._totalCalories);
        Storage.removeMeal(id);

        this._renderStats();
    }

    addWorkout(workout){
        this._workouts.push(workout);
        this._totalCalories -= workout.calorie;

        Storage.updateTotalCalories(this._totalCalories);
        Storage.saveWorkouts(workout);

        this._displayNewWorkout(workout);
        this._renderStats();
    }

    removeWorkout(id){
        const indexOfWorkout = this._workouts.findIndex(workout => workout.id === id);
        const workout = this._workouts[indexOfWorkout];

        this._totalCalories += workout.calorie;

        this._workouts.splice(indexOfWorkout, 1);

        Storage.updateTotalCalories(this._totalCalories);
        Storage.removeWorkout(id);

        this._renderStats();
    }

    reset(){
        this._totalCalories = 0;
        this._meals = [];
        this._workouts = [];

        Storage.updateTotalCalories(this._totalCalories);
        Storage.clearAll();

        this._displayCaloriesLimit();
        this._renderStats();
    }

    setLimit(limit){
        this._calorieLimit = limit;
        Storage.setCalorieLimit(limit);
        this._displayCaloriesLimit();
        this._renderStats();
    }

    loadItems(){
        this._meals.forEach(meal => {this._displayNewMeal(meal)})

        this._workouts.forEach(workout => {this._displayNewWorkout(workout)})
    }
    

    // private methods

    _displayCaloriesTotal() {
        const caloriesTotalEle = document.getElementById("calories-total");
        caloriesTotalEle.innerHTML = this._totalCalories;
    }

    _displayCaloriesLimit() {
        const caloriesLimitEle = document.getElementById("calories-limit");
        caloriesLimitEle.innerHTML = this._calorieLimit;
    }

    _displayCaloriesConsumed() {
        const caloriesConsumedEle = document.getElementById("calories-consumed");
        caloriesConsumedEle.innerHTML = this._meals.reduce((total, currentValue) => {
            return (currentValue.calorie+total);
        },0);
    }

    _displayCaloriesBurned(){
        const caloriesBurnedEle = document.getElementById("calories-burned");
        const burned = this._workouts.reduce((total, currentValue) => {
            return (total + currentValue.calorie);
        }, 0);

        caloriesBurnedEle.innerHTML = burned;
    }

    _displayCaloriesRemaining(){
        const caloriesRemainingEle = document.getElementById("calories-remaining");
        const progressBarEle = document.getElementById("calorie-progress");
        const remaining = this._calorieLimit - this._totalCalories;
        caloriesRemainingEle.innerHTML = remaining;

        if (remaining <= 0){
            caloriesRemainingEle.parentElement.parentElement.classList.remove("bg-light");
            caloriesRemainingEle.parentElement.parentElement.classList.add("bg-danger");

            progressBarEle.classList.add("bg-danger");
        }else {
            caloriesRemainingEle.parentElement.parentElement.classList.remove("bg-danger");
            caloriesRemainingEle.parentElement.parentElement.classList.add("bg-light");

            progressBarEle.classList.remove("bg-danger");
        }
    }

    _displayCaloriesProgress(){
        const progressBarEle = document.getElementById("calorie-progress");
        const progressPercentage = (this._totalCalories / this._calorieLimit) * 100;
        const width = Math.min(progressPercentage, 100);
        progressBarEle.style.width = `${width}%`;
    }

    _displayNewMeal(meal){
        const mealsItemEle = document.getElementById("meal-items");

        const itemEle = document.createElement("div");
        itemEle.classList.add("card", "my-2");
        itemEle.innerHTML = `<div class="card-body" data-id="${meal.id}">
                <div class="d-flex align-items-center justify-content-between">
                  <h4 class="mx-1">${meal.name}</h4>
                  <div
                    class="fs-1 bg-primary text-white text-center rounded-2 px-2 px-sm-5"
                  >
                    ${meal.calorie}
                  </div>
                  <button class="delete btn btn-danger btn-sm mx-2">
                    <i class="fa-solid fa-xmark"></i>
                  </button>
                </div>
              </div>`;

        mealsItemEle.appendChild(itemEle);
    }

    _displayNewWorkout(workout){
        const workoutsItemEle = document.getElementById("workout-items");

        const itemEle = document.createElement("div");
        itemEle.classList.add("card", "my-2");
        itemEle.innerHTML = `<div class="card-body" data-id="${workout.id}">
                <div class="d-flex align-items-center justify-content-between">
                  <h4 class="mx-1">${workout.name}</h4>
                  <div
                    class="fs-1 bg-secondary text-white text-center rounded-2 px-2 px-sm-5"
                  >
                    ${workout.calorie}
                  </div>
                  <button class="delete btn btn-danger btn-sm mx-2">
                    <i class="fa-solid fa-xmark"></i>
                  </button>
                </div>
              </div>`;

        workoutsItemEle.appendChild(itemEle);
    }

    _renderStats(){
        this._displayCaloriesTotal();
        this._displayCaloriesConsumed();
        this._displayCaloriesBurned();
        this._displayCaloriesRemaining();
        this._displayCaloriesProgress();
    }

}

// meal class

class Meal{
    constructor(name, calorie) {
        this.id = Math.random().toString(16).slice(2);
        this.name = name;
        this.calorie = calorie;
    }
}

// workout class

class Workout{
    constructor(name,calorie) {
        this.id = Math.random().toString(16).slice(2);
        this.name = name;
        this.calorie = calorie;
    }
}


class App{
    constructor() {
        this._tracker = new calorieTracker();

        this._initEventListener();

        this._tracker.loadItems();
    }

    // private method

    _initEventListener(){
        document.getElementById("meal-form").addEventListener("submit", this._newItem.bind(this,"meal"));

        document.getElementById("workout-form").addEventListener("submit", this._newItem.bind(this, "workout"));

        document.getElementById("meal-items").addEventListener("click", this._removeItem.bind(this, "meal"));

        document.getElementById("workout-items").addEventListener("click", this._removeItem.bind(this, "workout"));

        document.getElementById("filter-meals").addEventListener("input", this._filterItems.bind(this, "meal"));

        document.getElementById("filter-workouts").addEventListener("input", this._filterItems.bind(this, "workout"));

        document.getElementById("reset").addEventListener("click", this._reset.bind(this));

        document.getElementById("limit-form").addEventListener("submit", this._setLimit.bind(this));

        document.getElementById("meals").addEventListener("click", this._changeIcon.bind(this, "meal"));

        document.getElementById("workouts").addEventListener("click", this._changeIcon.bind(this, "workout"));
    }

    _newItem(type, evt){
        evt.preventDefault();

        const itemName = document.getElementById(`${type}-name`);
        const itemCalories = document.getElementById(`${type}-calories`);

        if (itemName.value === "" || itemCalories.value === ""){
            alert("Please fill out all the fields.")
            return 0;
        }

        if (type === "meal"){
            const meal = new Meal(itemName.value, itemCalories.value*1);

            this._tracker.addMeal(meal);
        }else if (type === "workout"){
            const workout = new Workout(itemName.value, itemCalories.value*1);

            this._tracker.addWorkout(workout);
        }

        itemName.value = "";
        itemCalories.value = "";
    }

    _changeIcon(type, evt){
        evt.preventDefault();
        const iconEle = document.getElementById(`${type}-icon`);

        if (evt.target.classList.contains("btn") || evt.target.classList.contains("fa-solid")){
            if (iconEle.classList.contains("fa-plus")){
                iconEle.classList.remove("fa-plus");
                iconEle.classList.add("fa-minus");
            }else if (iconEle.classList.contains("fa-minus")){
                iconEle.classList.remove("fa-minus");
                iconEle.classList.add("fa-plus");
            }
        }

    }

    _removeItem(type,evt){
        if (evt.target.classList.contains("delete") || evt.target.classList.contains("fa-solid")){

            if (confirm("Are you sure you want to delete the item?")){
                const id = evt.target.closest(".card-body").getAttribute("data-id");

                if (type === "meal"){
                    this._tracker.removeMeal(id);

                }else if (type === "workout"){
                    this._tracker.removeWorkout(id);
                }

                evt.target.closest(".card").remove();
            }
        }
    }

    _filterItems(type, evt){
        const searchValue = evt.target.value.toLowerCase();

        document.querySelectorAll(`#${type}-items .card`).forEach(item => {
            const name = item.firstElementChild.firstElementChild.firstElementChild.textContent.toLowerCase();

            if (name.includes(searchValue, 0)) {
                item.style.display = "block"
            }else {
                item.style.display = "none"
            }
        });


    }

    _reset(){
        if (confirm("Are you sure about resetting the day?")){
            this._tracker.reset();

            document.getElementById("meal-items").innerHTML = "";
            document.getElementById("workout-items").innerHTML = "";

            document.getElementById("filter-meals").value = "";
            document.getElementById("filter-workouts").value = "";
        }
    }

    _setLimit(evt){
        evt.preventDefault();

        const limit = document.getElementById("limit");
        if (limit.value === ""){
            alert("Please fill the limit field.")
            return 0
        }

        this._tracker.setLimit(limit.value*1);

        limit.value = "";

        const limitModal = bootstrap.Modal.getInstance(document.getElementById("limit-modal"));
        limitModal.hide();

    }
}

class Storage{
    static getCalorieLimit(defaultLimit = 2000){
        let calorieLimit;

        if (localStorage.getItem("calorieLimit") === null){
            calorieLimit = defaultLimit;
        }else{
            calorieLimit = localStorage.getItem("calorieLimit")*1
        }

        return calorieLimit;
    }

    static setCalorieLimit(calorieLimit){
        localStorage.setItem("calorieLimit",calorieLimit);
    }

    static getTotalCalories(defaultTotalCalories = 0){
        let totalCalories;

        if (localStorage.getItem("totalCalories") === null){
            totalCalories = defaultTotalCalories;
        }else{
            totalCalories = localStorage.getItem("totalCalories")*1
        }

        return totalCalories;
    }

    static updateTotalCalories(totalCalories){
        localStorage.setItem("totalCalories",totalCalories);
    }

    static getMeals(){
        let meals;

        if (localStorage.getItem("meals") === null){
            meals = [];
        }else{
            meals = JSON.parse(localStorage.getItem("meals"));
        }

        return meals;
    }

    static saveMeal(meal){
        const meals = Storage.getMeals();
        meals.push(meal);
        localStorage.setItem("meals",JSON.stringify(meals))
    }

    static removeMeal(id){
        const meals = Storage.getMeals();
        meals.forEach((meal, index)=> {
            if (meal.id === id){
                meals.splice(index, 1)
            }
        })

        localStorage.setItem("meals", JSON.stringify(meals));
    }

    static getWorkouts(){
        let workouts;

        if (localStorage.getItem("workouts") === null){
            workouts = [];
        }else {
            workouts = JSON.parse(localStorage.getItem("workouts"));
        }

        return workouts;
    }

    static saveWorkouts(workout){
        const workouts = Storage.getWorkouts();
        workouts.push(workout);
        localStorage.setItem("workouts", JSON.stringify(workouts))
    }

    static removeWorkout(id){
        const workouts = Storage.getWorkouts();
        workouts.forEach((workout, index)=> {
            if (workout.id === id){
                workouts.splice(index, 1)
            }
        })

        localStorage.setItem("workouts", JSON.stringify(workouts));
    }

    static clearAll(){
        const removeList = ["meals", "workouts", "totalCalories"];

        for (const value of removeList) {
            localStorage.removeItem(value)
        }
    }
}



const app = new App();
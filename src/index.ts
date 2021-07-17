import { TodoItem } from "./todoItem";
import { TodoCollection } from "./todoCollection";
import * as inquirer from 'inquirer';
import  {JsonTodoCollection } from './jsonTodoCollection';

let tasks = [
    "kupić kwiaty",
    "odebrać buty",
    "zamówić bilety",
    "zadzwonić do janka"
]

let todos: TodoItem[] = []

for(let i: number = 1; i <= tasks.length; i++) {
    todos.push(new TodoItem(i, tasks[i-1]))
}

let collection: TodoCollection = new JsonTodoCollection("Adam", todos);
let showCompleted = true;

function displayTodoList(): void {
    console.log(`Lista ${collection.userName}a` + 
    `\n(liczba zadań pozostałych do zrobienia: ${collection.getItemCounts().incomplete})` +
    `\n(liczba zadań ukończonych: ${collection.getItemCounts().complete})`);
    collection.getTodoItems(showCompleted).forEach(item => item.printDetails());
}

enum Commands {
    Add = "Dodaj nowe zadanie",
    Complete = "Wykonanie zadania",
    Toggle = "Pokaż lub ukryj wykonane",
    Purge = "Usuń wykonane zadania",
    Quit = "Koniec"
}

function promptAdd(): void {
    console.clear();
    inquirer.prompt({
        type: "input",
        name: "add",
        message: "Podaj zadanie:"
    }).then(answears => {
        if (answears["add"] !== "") {
            collection.addTodo(answears["add"])
        }
        promptUser();
    })
}

function promptComplete(): void {
    console.clear();
    displayTodoList();
    inquirer.prompt({
        type: "checkbox",
        name: "complete",
        message: "Oznaczenie zadań jako wykonanych",
        choices: collection.getTodoItems(showCompleted).map(item =>
            ({name: item.task, value: item.id, checked: item.complete}))
    }).then(answears => {
        let completedTasks = answears["complete"] as number[];
        collection.getTodoItems(true).forEach(item =>
            collection.markComplete(item.id,
                completedTasks.find(id => id === item.id) != undefined));
        promptUser();
    })
}

function promptUser(): void {
    console.clear();
    displayTodoList();
    inquirer.prompt({
        type: "list",
        name: "command",
        message: "Wybierz opcję",
        choices: Object.values(Commands),
        //badPropery: true
    }).then(answears => {
        switch (answears["command"]) {
            case Commands.Toggle:
                showCompleted = !showCompleted
                promptUser();
                break;
            case Commands.Add:
                promptAdd();
                break;
            case Commands.Complete:
                if (collection.getItemCounts().incomplete > 0) {
                    promptComplete();
                } else {
                    promptUser();
                }
                break;
            case Commands.Purge:
                collection.removeComplete();
                promptUser();
                break;
        }
    })
}
promptUser();
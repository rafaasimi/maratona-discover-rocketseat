// Abrir e fechar Modal
const Modal = {
  open() {
    document.querySelector(".modal-overlay").classList.add("active");
  },
  close() {
    document.querySelector(".modal-overlay").classList.remove("active");
  },
};

// Salvar/Pegar informações no LocalStorage
const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
  },
  set(transactions){
    localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
  },
}


// Mostrar/Esconder valores de entradas/saidas/total
const visibilityEye = document.querySelector("#visibilityEye");
const cardValues = document.querySelectorAll(".card p");
const dataIncomeValues = document.querySelectorAll(".income");
const dataExpenseValues = document.querySelectorAll(".expense");
let visibilityState = true;

const visibilityValues = {
  toggle() {
    if (visibilityState) {
      cardValues.forEach((value) => {
        value.style.filter = `blur(5px)`;
      });
      // dataIncomeValues.forEach((value) => {
      //     value.style.filter = `blur(5px)`
      // })
      // dataExpenseValues.forEach((value) => {
      //     value.style.filter = `blur(5px)`
      // })
      visibilityEye.src = "./assets/eye-hidden.png";
      visibilityState = false;
    } else {
      cardValues.forEach((value) => {
        value.style.filter = `blur(0px)`;
      });
      // dataIncomeValues.forEach((value) => {
      //     value.style.filter = `blur(0px)`
      // })
      // dataExpenseValues.forEach((value) => {
      //     value.style.filter = `blur(0px)`
      // })
      visibilityEye.src = "./assets/eye-visible.png";
      visibilityState = true;
    }
  },
};

// Inserir ano atual no footer
document.querySelector("#current-year").innerText = new Date().getFullYear();

// Calculos das transações
const Transaction = {
  all: Storage.get(),

  add(transaction) {
    Transaction.all.push(transaction);
    App.reload();
  },

  remove(index) {
    Transaction.all.splice(index, 1);
    App.reload();
  },

  incomes() {
    let income = 0;
    // Somar todas as entradas
    Transaction.all.forEach((transaction) => {
      transaction.amount > 0 ? (income += transaction.amount) : income;
    });

    return income;
  },

  expenses() {
    let expense = 0;
    // Somar todas as saídas
    Transaction.all.forEach((transaction) => {
      transaction.amount < 0 ? (expense += transaction.amount) : expense;
    });

    return expense;
  },

  total() {
    // Calcular o total de entradas-saídas
    return Transaction.incomes() + Transaction.expenses();
  },
};

// Formatação de Moeda
const Utils = {
  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : "";
    value = String(value).replace(/\D/g, "");
    value = Number(value) / 100;
    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    return signal + value;
  },

  formatAmount(value) {
    value = Number(value) * 100;

    return value;
  },

  formatDate(date) {
    const splittedDate = date.split("-");

    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
  },
};

const Form = {
  description: document.querySelector("input#description"),
  amount: document.querySelector("input#amount"),
  date: document.querySelector("input#date"),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value,
    };
  },

  validateFields() {
    const { description, amount, date } = Form.getValues();

    if (
      description.trim() === "" ||
      amount.trim() === "" ||
      date.trim() === ""
    ) {
      throw new Error("Por favor, preencha todos os campos.");
    }
  },

  formatValues() {
    let { description, amount, date } = Form.getValues();

    amount = Utils.formatAmount(amount);
    date = Utils.formatDate(date);

    return {
      description,
      amount,
      date,
    };
  },

  saveTransaction(transaction) {
    Transaction.add(transaction);
  },

  clearFields() {
    Form.description.value = "";
    Form.amount.value = "";
    Form.date.value = "";
  },

  submit(event) {
    event.preventDefault();

    try {
      // Validar os campos preenchidos
      Form.validateFields();
      // Formatar os dados
      const transaction = Form.formatValues();
      // Salvar dados
      Form.saveTransaction(transaction);
      //   Apagar dados do formulario
      Form.clearFields();
      // Fechar o modal
      Modal.close();
    } catch (error) {
      alert(error.message);
    }
  },
};


// Coloca os dados das transações no HTML
const DOM = {
  transactionsContainer: document.querySelector("#data-table tbody"),

  addTransaction(transaction, index) {
    const tr = document.createElement("tr");
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
    tr.dataset.index = index;

    DOM.transactionsContainer.appendChild(tr);
  },

  innerHTMLTransaction({ description, amount, date }, index) {
    const CSSClass = amount > 0 ? "income" : "expense";

    amount = Utils.formatCurrency(amount);

    const html = `
            <td class="description">${description}</td>
            <td class="${CSSClass}">${amount}</td>
            <td class="date">${date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
            </td>
        `;
    return html;
  },

  updateBalance() {
    document.getElementById("incomeDisplay").innerHTML = Utils.formatCurrency(
      Transaction.incomes()
    );
    document.getElementById("expenseDisplay").innerHTML = Utils.formatCurrency(
      Transaction.expenses()
    );
    document.getElementById("totalDisplay").innerHTML = Utils.formatCurrency(
      Transaction.total()
    );
  },

  clearTransactions() {
    DOM.transactionsContainer.innerHTML = "";
  },
};

const App = {
  init() {
    Transaction.all.forEach((transaction, index) => {
      DOM.addTransaction(transaction, index);
    });

    DOM.updateBalance();
    Storage.set(Transaction.all);
  },
  reload() {
    DOM.clearTransactions();
    App.init();
  },
};

App.init();

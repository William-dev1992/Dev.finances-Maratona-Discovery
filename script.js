const Modal = {
  open() {
    document
      .querySelector('.modal-overlay')
      .classList
      .add('active')
  },
  close() {
    document
      .querySelector('.modal-overlay')
      .classList
      .remove('active')
  }
}

const ModalExep = {
  open() {
    document
      .querySelector('.modal-overlay-expecifics')
      .classList
      .add('active')
  },
  close() {
    document
      .querySelector('.modal-overlay-expecifics')
      .classList
      .remove('active')
  }
}

const DOM = {
  transactionsConatiner: document.querySelector('#data-table tbody'),
  addTransaction(transaction, index) {
    const tr = document.createElement('tr')
    tr.onclick = () => {
      ModalExep.open()

      DOM.transactionsExpecifics(transaction, index)
    }
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
    tr.dataset.index = index

    DOM.transactionsConatiner.appendChild(tr)
  },

  innerHTMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? 'income' : 'expense'

    const amount = Utils.formatCurrency(transaction.amount)

    const html = `
      <td class="description">${transaction.description}</td>
      <td class="${CSSclass}">${amount}</td>
      <td class="date">${transaction.date}</td>
    `

    return html
  },

  transactionsExpecifics(transaction,index) {
    const container = document.querySelector('.modal-expecifics')

    const html = `
      <h2>Informações da transação</h2>
      <small class="help">Descrição</small>
      <div class="description">
        ${transaction.description}
      </div>

      <small class="help">Valor da transação</small>
      <div class="amount">
        ${transaction.amount}
      </div>

      <small class="help">Opção de pagamento</small>
      <div class="paymentOP">
        ${transaction.paymentOP}
      </div>

      <small class="help">Data da transação</small>
      <div class="date">
        ${transaction.date}
      </div>

      <div class="input-group actions">
        <a href="#" onclick="Transaction.remove(${index}), ModalExep.close()" class="button cancel">Deletar</a>
        <button onclick="ModalExep.close()" >Voltar</button>
      </div>
    `

    container.innerHTML = html

    return html
  },

  updateBalance() {
    document.querySelector('#incomesDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes())
    document.querySelector('#expensesDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses())
    document.querySelector('#totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total())
  },

  clearTransactions() {
    DOM.transactionsConatiner.innerHTML = ""
  },
}

const Utils = {
  formatAmount(value) {
    value = Number(value) * 100
    return Math.round(value)
  },

  formatDate(date) {
    const splittedDate = date.split("-")
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
  },

  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : ""

    value = String(value).replace(/\D/g, "")

    value = Number(value) / 100

    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })

    return signal + value
  }
}

const Form = {
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  paymentOP: document.querySelector('input#paymentOP'),
  date: document.querySelector('input#date'),

  getValue() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      paymentOP: Form.paymentOP.value,
      date: Form.date.value,
    }
  },

  validateFields() {
    const { description, amount, paymentOP, date } = Form.getValue()

    if (description.trim() === "" ||
      amount.trim() === "" ||
      date.trim() === ""  ||
      paymentOP.trim() === "") {
      throw new Error("Por favor, preencha todos os campos")
    }
  },

  formatValues() {
    let { description, amount, paymentOP, date } = Form.getValue()

    amount = Utils.formatAmount(amount);

    date = Utils.formatDate(date);

    return {
      description,
      amount,
      paymentOP,
      date
    }

  },

  clearFields() {
    Form.description.value = ""
    Form.amount.value = ""
    Form.paymentOP.value = ""
    Form.date.value = ""
  },

  submit(event) {
    event.preventDefault()

    try {
      Form.validateFields();
      const transaction = Form.formatValues();
      Transaction.add(transaction)
      Form.clearFields()
      Modal.close()
      App.reload()
    } catch (error) {
      alert(error.message)
    }


  },
}

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("dev.fiances:transactions")) || []
  },

  set(transactions) {
    localStorage.setItem("dev.fiances:transactions", JSON.stringify(transactions))
  }
}

const Transaction = {
  all: Storage.get(),

  add(transaction) {
    Transaction.all.push(transaction)
  },

  remove(index) {
    Transaction.all.splice(index, 1)

    App.reload()
  },

  incomes() {
    let income = 0;

    Transaction.all.forEach((transaction) => {
      if (transaction.amount > 0) {
        income += transaction.amount;
      }
    })

    return income
  },
  expenses() {
    let expense = 0;

    Transaction.all.forEach((transaction) => {
      if (transaction.amount < 0) {
        expense += transaction.amount;
      }
    })

    return expense

  },
  total() {
    return Transaction.incomes() + Transaction.expenses()

  }
}

const App = {
  init() {
    Transaction.all.forEach((transaction, index) => {
      DOM.addTransaction(transaction, index);
    })

    DOM.updateBalance()

    Storage.set(Transaction.all)

  },
  reload() {
    DOM.clearTransactions()
    App.init()
  },
}

App.init()
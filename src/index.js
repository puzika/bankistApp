'use strict';

import './sass/main.scss';

const app = document.querySelector('.app');
const welcomeMessage = document.querySelector('.welcome-message');
const loginUser = document.querySelector('.login__user');
const loginPassword = document.querySelector('.login__password');
const loginButton = document.querySelector('.login__submit');
const movements = document.querySelector('.transactions');
const balanceValue = document.querySelector('.balance__value');
const balanceDate = document.querySelector('.date');
const totalDeposit = document.querySelector('.summary__value--deposit');
const totalWithdrawal = document.querySelector('.summary__value--withdrawal');
const transferRecepient = document.querySelector('.form__input--recepient');
const transferAmount = document.querySelector('.form__input--transfer-amount');
const transferButton = document.querySelector('.form__submit--transfer');
const loanAmount = document.querySelector('.form__input--loan-amount');
const loanButton = document.querySelector('.form__submit--loan');
const closeUser = document.querySelector('.form__input--user');
const closePassword = document.querySelector('.form__input--pin');
const closeButton = document.querySelector('.form__submit--close');
const sortButton = document.querySelector('.sort');
const timer = document.querySelector('.timer__value');

function CreateAccount(name, pin, movements) {
   const user = name.split(' ').map(currValue => currValue[0].toLowerCase()).join('');
   let totalDeposit = 0;
   let totalWithdrawal = 0;
   let balance = 0;

   for (let index = 0; index < movements.length; index++) {
      if (movements[index] > 0) totalDeposit += movements[index];
      else totalWithdrawal += -movements[index];

      balance += movements[index];
   }

   return {
      name,
      user,
      pin,
      movements,
      totalDeposit,
      totalWithdrawal,
      balance,
   }
}

const account1 = CreateAccount('Bruce Wayne', 1111, [10000, 4000, -1250, 1500, -5000, 5500, 1750, 4500, -2000, 2000]);
const account2 = CreateAccount('Rachel Dawes', 2222, [2700, -400, -300, 1000, 670, -1200, 6800, 1500, 550, -600]);

const accounts = [account1, account2];
const LOGOUTTIME = 600;

let currAccount;
let sorted = false;
let logOutTimer;

function formateDate(date) {
   return new Intl.DateTimeFormat(['en-US', 'ru'], { month: '2-digit', day: '2-digit', year: 'numeric' }).format(date);
}

function formatMoney(value) {
   return new Intl.NumberFormat(['en-US', 'ru'], { style: 'currency', currency: 'USD' }).format(value.toFixed(2));
}

function clearFields(...fields) {
   fields.forEach(field => {
      field.value = '';
      field.blur();
   });
}

function renderMovement(movement, movementNumber) {
   const type = (movement > 0) ? 'deposit' : 'withdrawal';
   const date = formateDate(new Date());
   const movementValue = formatMoney(movement);

   const markup = `
      <div class="transactions__row">
         <div class="transactions__type transactions__type--${type}">${movementNumber} ${type}</div>
         <div class="transactions__date">${date}</div>
         <div class="transactions__value">${movementValue}</div>
      </div>
   `;

   movements.insertAdjacentHTML('afterbegin', markup);
}

function renderApp(currAccount) {
   const movs = currAccount.movements;

   for (let index = 0; index < movs.length; index++) {
      renderMovement(movs[index], index + 1);
   }

   welcomeMessage.textContent = `Welcome, ${currAccount.name}`;

   balanceDate.textContent = new Intl.DateTimeFormat(['en-US', 'ru'], { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date());
   balanceValue.textContent = formatMoney(currAccount.balance);
   totalDeposit.textContent = formatMoney(currAccount.totalDeposit);
   totalWithdrawal.textContent = formatMoney(currAccount.totalWithdrawal);
}

function updateFigures(movementValue, account) {
   account.movements.push(movementValue);
   account.balance += movementValue;
   if (movementValue > 0) account.totalDeposit += movementValue;
   else account.totalWithdrawal += -movementValue;
}

function updateView(movementValue) {
   renderMovement(movementValue, currAccount.movements.length);
   balanceValue.textContent = formatMoney(currAccount.balance);
   totalDeposit.textContent = formatMoney(currAccount.totalDeposit);
   totalWithdrawal.textContent = formatMoney(currAccount.totalWithdrawal);
}

function deleteAccount(index) {
   [accounts[index], accounts[accounts.length - 1]] = [accounts[accounts.length - 1], accounts[index]];

   accounts.pop();
}

function sortMovements(sorted) {
   movements.innerHTML = '';

   const movs = currAccount.movements.slice();

   if (!sorted) movs.sort((a, b) => a - b);

   for (let index = 0; index < movs.length; index++) {
      renderMovement(movs[index], index + 1);
   }
}

function startTimer(time) {
   const countdown = setInterval(() => {
      if (time === 0) {
         app.classList.add('app--hidden');
         clearInterval(countdown);
      }

      let minutes = `${Math.trunc(time / 60)}`.padStart(2, '0');
      let seconds = `${time % 60}`.padStart(2, '0');
      timer.textContent = `${minutes}:${seconds}`;
      time--;
   }, 1000);

   return countdown;
}

function restartTimer() {
   clearInterval(logOutTimer);
   logOutTimer = startTimer(LOGOUTTIME);
}

loginButton.addEventListener('click', function (e) {
   e.preventDefault();

   restartTimer();

   const accountInd = accounts.findIndex(account => account.user === loginUser.value.trim() && `${account.pin}` === loginPassword.value.trim());

   if (accountInd === -1) {
      alert('User not found');
      clearFields(loginPassword, loginUser);
      loginUser.focus();
      return;
   }

   currAccount = accounts[accountInd];

   app.classList.remove('app--hidden');
   renderApp(currAccount);
   clearFields(loginPassword, loginUser);
});

transferButton.addEventListener('click', function (e) {
   e.preventDefault();

   restartTimer();

   const value = +transferAmount.value.trim();

   if (!Number.isFinite(value)) {
      alert('Invalid input');
      return;
   }

   if (value >= currAccount.balance) {
      alert('Insufficient funds');
      clearFields(transferRecepient, transferAmount);
      transferRecepient.focus();
      return;
   }

   const accountInd = accounts.findIndex(account => account.user === transferRecepient.value.trim());

   if (accountInd === -1) {
      alert(`Recepient '${loginUser.value}' not found`);
      clearFields(transferRecepient, transferAmount);
      transferRecepient.focus();
      return;
   }

   const recepient = accounts[accountInd];

   updateFigures(value, recepient);
   updateFigures(-value, currAccount);
   updateView(-value);
   clearFields(transferAmount, transferRecepient);
});

loanButton.addEventListener('click', function (e) {
   e.preventDefault();

   restartTimer();

   const value = +loanAmount.value.trim();

   if (!Number.isFinite(value)) {
      alert('Invalid input');
      return;
   }

   if (value > currAccount.balance) {
      alert('Loan denied');
      loanAmount.value = '';
      return;
   }

   updateFigures(value, currAccount);
   updateView(value);
   clearFields(loanAmount);
});

closeButton.addEventListener('click', function (e) {
   e.preventDefault();

   restartTimer();

   const accountInd = accounts.findIndex(account => account.user === closeUser.value.trim() && `${account.pin}` === closePassword.value.trim());

   if (accountInd === -1) {
      alert(`Invalid username/PIN`);
      clearFields(closePassword, closeUser);
      closeUser.focus();
      return;
   }

   app.classList.add('app--hidden');
   clearFields(closePassword, closeUser);
   deleteAccount(accountInd);
   welcomeMessage.textContent = 'Log in to get started';
   clearInterval(logOutTimer);
   let minutes = `${Math.trunc(LOGOUTTIME / 60)}`.padStart(2, '0');
   let seconds = `${LOGOUTTIME % 60}`.padStart(2, '0');
   timer.textContent = `${minutes}:${seconds}`;
});

sortButton.addEventListener('click', function () {
   restartTimer();

   sortMovements(sorted);

   sorted = !sorted;
});
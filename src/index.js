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

let currAccount;

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

loginButton.addEventListener('click', function (e) {
   e.preventDefault();

   const accountInd = accounts.findIndex(account => account.user === loginUser.value && `${account.pin}` === loginPassword.value);

   if (accountInd === -1) return;

   currAccount = accounts[accountInd];

   app.classList.remove('app--hidden');

   renderApp(currAccount);

   clearFields(loginPassword, loginUser);
})
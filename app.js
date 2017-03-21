angular
  .module('app', ['firebase'])
  .constant('firebaseConfig', {
    apiKey: "<API_KEY>",
    authDomain: "<PROJECT_ID>.firebaseapp.com",
    databaseURL: "https://<DATABASE_NAME>.firebaseio.com",
    storageBucket: "<BUCKET>.appspot.com",
    messagingSenderId: "<SENDER_ID>",
  })
  .run(firebaseConfig => firebase.initializeApp(firebaseConfig))
  .service('dbRefRoot', DbRefRoot)
  .service('accounts', Accounts)
  .factory('accountFactory', AccountFactory)
  .factory('accountListFactory', AccountListFactory)
  .controller('AccountCtrl', AccountCtrl)

function AccountFactory($firebaseObject, $firebaseUtils) {
  return $firebaseObject.$extend({
    $$updated: function (snap) {
      const changed = $firebaseObject.prototype.$$updated.apply(this, arguments);
       if (changed) {
        this.birthDate = this.birthDate ? new Date(this.birthDate) : null
      }
      return changed
    },

    toJSON: function () {
      return $firebaseUtils.toJSON(angular.extend({}, this, {
        birthDate: this.birthDate ? this.birthDate.getTime() : null
      }))
    },

    $$defaults: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      birthDate: new Date(),
      balance: 0,
    }
  })
}

function AccountListFactory($firebaseArray, accountFactory) {
  return $firebaseArray.$extend({
    $$added: function(snap) {
      return accountFactory(snap.ref)
    },
    $$updated: function(snap) {
      return accountFactory(snap.ref)
    }
  })
}
function DbRefRoot() {
  return firebase.database().ref()
}

function Accounts(dbRefRoot, accountFactory, accountListFactory) {
  const dbRefAccounts = dbRefRoot.child('accounts')
  this.get = id => accountFactory(dbRefAccounts.child(id))
  this.getAll = () => accountListFactory(dbRefAccounts)
  this.getDefaults = () => accountFactory(dbRefAccounts.child(0))
}

function AccountCtrl(accounts) {
  this.newAccount = accounts.getDefaults()
  this.account = accounts.get('1234567890ABCDEF1234567890ABCDE3')
  this.accounts = accounts.getAll()
  this.remove = account => {
    if (confirm("Are your sure you want to delete this account?")) {
      this.accounts.$remove(account)
    }
  }
  
  this.save = account => { this.accounts.$save(account) }
  this.addAccount = newAccount => {
    this.accounts
      .$add(newAccount)
      .then( newRef => { this.newAccount = accounts.getDefaults() })
  }

}

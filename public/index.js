const SYSTEMCOMPONENTURL = '/api/systemcomponent'
let jwt

/**
 * Code to generate a v4 UUID

function asHex(value) {
  return Array.from(value).map(i => ('00' + i.toString(16)).slice(-2)).join('');
}

function getRandomBytes(size) {
  if ((typeof Uint8Array == 'function') && window.crypto) {
    let buffer = new Uint8Array(size);
    return window.crypto.getRandomValues(buffer);
  }
  return Array.from(new Array(size), () => Math.random() * 255 | 0);
}

/*
function generateUuid() {
  const version = 0b01000000;
  const clockSeqHiAndReserved = getRandomBytes(1);
  const timeHiAndVersion = getRandomBytes(2);
  clockSeqHiAndReserved[0] &= 0b00111111 | 0b10000000;
  timeHiAndVersion[0] &= 0b00001111 | version;
  return [
    asHex(getRandomBytes(4)), // time-low
    '-',
    asHex(getRandomBytes(2)), // time-mid
    '-',
    asHex(timeHiAndVersion), // time-high-and-version
    '-',
    asHex(clockSeqHiAndReserved), // clock-seq-and-reserved
    asHex(getRandomBytes(1)), // clock-seq-loq
    '-',
    asHex(getRandomBytes(6)) // node
  ].join('');
}
*/

function StorageException(message) {
  this.message = message
  this.name = "StorageException"
}

/**
 * Building a model to store devices which will be managed via CRUD

const SYSTEMCOMPONENTS = {
  create: function (name, safeTempThreshold, isHuman) {
    console.log(`creating a new system component`)
    const item = {
      name,
      isHuman,
      safeTempThreshold,
      id: generateUuid(),
      installedDate: Date.now(),
      readings: []
    }
    this.items.push(item)
    return item
  },
  get: function () {
    console.log(`Retrieving system component list...`)
    return this.items
  },
  delete: function (itemId) {
    console.log(`Deleting system component \`${itemId}\``)
    const index = this.items.findIndex(function (item) {
      return itemId == item.id
    })
    this.items.splice(index, 1)
  },
  update: function (updatedItem) {
    console.log(`Running update...`)
    console.log(updatedItem)
    // Why does this below result in just the ID number??
    const {
      id
    } = updatedItem
    const index = this.items.findIndex(function (item) {
      return item.id == id
    })
    if (index < 0) {
      // when this condition happens, the exception below is not being thrown
      throw StorageException(`\`${id}\` doesn't exist`)
    }
    console.log(this.items[index])
    console.log(updatedItem)
    let itemsToChange = this.items[index]
    Object.keys(updatedItem).forEach(function (key) {
      console.log(`key is ${key}`)
      console.log(`value is ${updatedItem[key]}`)
      if (key == 'readings') {
        console.log('push new readings onto items')
        console.log(itemsToChange.readings)
        console.log(updatedItem.readings)
        itemsToChange[key].push(updatedItem[key])
      } else {
        itemsToChange[key] = updatedItem[key]
      }
    })
    return updatedItem
  },
  items: []
}
*/

function renderNavigation(user = null){
  return `<ul>
    ${!user? `<li>
      <a id="register">register</a>
    </li>
    <li>
      <a id="login">log in</a>
    </li>`: `<li>
      <a id="logout">log out</a>
    </li>`}
    <li>
      <a href="#about">about</a>
    </li>
    ${user? `<li>
      <a id="addSystemComponent">add component</a>
    </li>`: ''}
  </ul>`
}

function displayNavigation(user = null) {
  $('nav').html(renderNavigation(user))
}

function displaySystemSummaryChart(systemComponents) {
  $('.systemSummaryChartArea').html(drawSystemSummaryChart(systemComponents))
}

// This function renders the systemSummary Chart.js graph
function drawSystemSummaryChart(systemComponents) {
  console.log("Creating the system components summary chart...")
  const nameLabels = systemComponents.map(function(systemComponent) {
    return systemComponent.name
  })
  const temperatureData = systemComponents.map(function(systemComponent) {
    return systemComponent.safeTempThreshold
  })
  const ctx = $('<canvas/>', {
    'class': 'systemSummaryChart',
    id: 'systemSummaryChart'
  })
  //document.getElementById(`${chartName}`).getContext('2d')
  const data = {
    "labels": nameLabels,
    "datasets": [{
      "label": "Safe Temperature Threshold (℃)",
      "data": temperatureData,
      "fill": false,
      "backgroundColor": "rgba(54, 162, 235, 0.2)",
      "borderColor": "rgb(54, 162, 235)",
      "borderWidth": 1
    }]
  }
  const options = {
    type: 'bar',
    data: data,
    options: {
      maintainAspectRatio: false,
      responsive: true,
      title: {
        display: true,
        text: 'System Components - Safe Temperature Threshold'
      },
      tooltips: {
        mode: 'index',
        intersect: false
      },
      responsive: true,
      scales: {
        xAxes: [{
          stacked: true,
        }],
        yAxes: [{
          stacked: true
        }]
      }
    }
  }
  const chart = new Chart(ctx, options)
  return ctx
}

// This function renders a Chart.js graph
function drawComponentGraph(systemComponent, user = null) {
  console.log("Creating a graph...")
  const ctx = $('<canvas/>', {
    'class': 'systemComponentGraph',
    id: '${systemComponent.name}'
  })
  //document.getElementById(`${chartName}`).getContext('2d')
  const data = {
    // Labels should be Date objects
    //    labels: [new Date(2017, 08, 16), new Date(2017, 08, 17), new Date(2017, 08, 18)],
    //  code below is not working using hard-coded dates instead
    labels: systemComponent.readings.map(function(reading) {
      return reading.date
    }),
    datasets: [{
      fill: false,
      label: 'Temperature',
      //      data: [20, 25, 34],
      // code below is not working, using hard-coded values instead
      data: systemComponent.readings.map(function(reading) {
        return reading.temperature
      }),
      borderColor: '#fe8b36',
      backgroundColor: '#fe8b36',
      lineTension: 0,
    }]
  }
  const options = {
    type: 'line',
    data: data,
    options: {
      fill: false,
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        xAxes: [{
          type: 'time',
          display: true,
          scaleLabel: {
            display: true,
            labelString: "Date",
          }
        }],
        yAxes: [{
          ticks: {
            beginAtZero: true,
          },
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'Temperature',
          }
        }]
      }
    }
  }
  const chart = new Chart(ctx, options)
  return ctx
}

function renderSystemComponent(systemComponent, user = null) {
  console.log(systemComponent)
  const div = $('<div></div>', {
    'class': 'systemComponentWindow',
    id: `${systemComponent.name}-div`
  })
  const editButton = $('<button></button>', {
    'class': 'editComponentButton',
    'data-id': `${systemComponent.id}`,
    'value': 'EDIT'
  })
  const addReadingButton = $('<button></button>', {
    'class': 'addReadingButton',
    'data-id': `${systemComponent.id}`,
    'value': 'ADD READING'
  })
  const deleteButton = $('<button></button>', {
    'class': 'deleteComponentButton',
    'data-id': `${systemComponent.id}`,
    'value': 'DELETE'
  })
  div.append(`<caption>${systemComponent.name} ${systemComponent.id}</caption>`)
  const graph = drawComponentGraph(systemComponent)
  div.append(graph)
  div.append(editButton)
  div.append(addReadingButton)
  div.append(deleteButton)
  return div
}

function renderRegisterScreen() {
  return `<form class="registerForm">
    <fieldset>
      <legend>Register:</legend>
      <input type="text" name="firstName" id="firstName" placeholder="First Name" required>
      <input type="text" name="lastName" id="lastName" placeholder="Last Name" required>
      <input type="text" name="username" id="username" placeholder="User ID" required>
      <input type="text" name="password" id="password" placeholder="Password" required>
      <input type="submit" value="SUBMIT" id="submit"></input>
    </fieldset>
  </form>`
}

function renderLogInScreen() {
  return `<form class="logInForm">
    <fieldset>
      <legend>Log In:</legend>
      <input type="text" name="username" id="username" placeholder="username" required>
      <input type="text" name="password" id="password" placeholder="password" required>
      <input type="submit" value="SUBMIT" id="submit"></input>
    </fieldset>
  </form>`
}

function handleRegistershow() {
  console.log("Waiting for someone to click the register item...")
  $('nav').on('click', '#register', function(event) {
    $('main').append(`
      <div class="register">
      </div>`)
    $('.register').html(renderRegisterScreen())
  })
}

function handleLogInshow() {
  console.log("Waiting for someone to click the log in item...")
  $('nav').on('click', '#login', function(event) {
    $('main').append(`
      <div class="login">
      </div>`)
    $('.login').html(renderLogInScreen())
  })
}

// This will be a loop which joins all system components in the model as LIs in a UL and displays it
function renderSystemComponentGroupStatusScreen(systemComponents, user = null) {
  console.log("Building System Component Group Status Screen...")
  console.log(`systemComponents: ${systemComponents}`)
  const systemComponentListItems = systemComponents.map(function(systemComponent) {
    return $('<li></li>').append(renderSystemComponent(systemComponent))
  })
  const systemComponentList = $('<ul></ul>').append(systemComponentListItems)
  // should not be doing appends within the render functions, just spit out text
  return systemComponentList
}

function displaySystemComponentGroupStatusScreen(systemComponents, user = jwt) {
  displayNavigation(user)
  displaySystemSummaryChart(systemComponents)
  if (jwt) {
    $('.componentGroupArea').html(renderSystemComponentGroupStatusScreen(systemComponents, user))
  }
}

function handleAddComponentShow() {
  console.log("waiting for someone to click the add component item...")
  $('nav').on('click', '#addSystemComponent', function(event) {
    $('main').append(`
      <div class="addSystemComponent">
      </div>`)
    $('.addSystemComponent').html(renderAddComponentScreen())
  })
}

function renderAddComponentScreen(user = null) {
  return `
  <form class="addSystemComponentForm">
    <fieldset>
      <legend>Add A Device For Management:</legend>
      <input type="text" name="name" id="name" placeholder="Name" required>
      <select name="isHuman" id="isHuman" required>
        <option value="">Human or Machine?</option>
        <option value="false">Machine</option>
        <option value="true">Human</option>
      </select>
      <input type="text" name="safeTempThreshold" id="safeTempThreshold" placeholder="Safe Temperature Threshold" required>
      <input type="submit" value="ADD" id="submit"></input>
    </fieldset>
  </form>
  `
}

function handleAddComponentFormSubmit() {
  $('main').on('submit', '.addSystemComponentForm', function(event) {
    event.preventDefault()
    const systemComponent = {
      name: $('#name').val(),
      safeTempThreshold: $('#safeTempThreshold').val(),
      isHuman: $('#isHuman').val(),
      installedDate: Date.now()
    }
    $('.addSystemComponent').remove()
    postSystemComponent(systemComponent, getAndDisplaySystemComponentGroupStatusScreen)
  })
}

function handleUpdateComponentShow() {
  console.log("waiting for someone to click the update component item...")
  $('nav').on('click', '#updateSystemComponent', function(event) {
    $('main').append(`
      <div class="updateSystemComponent">
      </div>`)
    $('.updateSystemComponent').html(renderUpdateComponentScreen())
  })
}

function renderUpdateComponentScreen(systemComponent, user = null) {
  return `
  <form class="updateSystemComponentForm" data-id="${systemComponent.id}">
    <fieldset>
      <legend>Modify Device "${systemComponent.id}"</legend>
      <input type="text" name="name" id="name" placeholder="Name" value="${systemComponent.name}">
      <select name="isHuman" id="isHuman">
        <option value="">Human or Machine?</option>
        <option value="false"${systemComponent.isHuman ? '' : ' selected'}>Machine</option>
        <option value="true"${systemComponent.isHuman ? ' selected' : ''}>Human</option>
      </select>
      <input type="text" name="safeTempThreshold" id="safeTempThreshold" placeholder="Safe Temperature Threshold" value="${systemComponent.safeTempThreshold}">
      <input type="submit" value="UPDATE" id="submit"></input>
    </fieldset>
  </form>
  `
}

function handleRegisterFormSubmit() {
  $('main').on('submit', '.registerForm', function(event) {
    event.preventDefault()
    const registerData = {
      firstName: $('#firstName').val(),
      lastName: $('#lastName').val(),
      username: $('#username').val(),
      password: $('#password').val()
    }
    console.log(registerData)
    addUser(registerData, getAndDisplaySystemComponentGroupStatusScreen)
    $('.registerForm').remove()
  })
}

function handleLogInFormSubmit() {
  $('main').on('submit', '.logInForm', function(event) {
    event.preventDefault()
    const logInData = {
      username: $('#username').val(),
      password: $('#password').val()
    }
    console.log(logInData)
    loginUser(logInData, getAndDisplaySystemComponentGroupStatusScreen)
  })
}

function handleUpdateComponentFormSubmit() {
  $('main').on('submit', '.updateSystemComponentForm', function(event) {
    event.preventDefault()
    const formData = $(":input").serializeArray()
    formData.push({
      name: 'id',
      value: $(event.currentTarget).data('id')
    })
    const componentUpdates = {}
    console.log(formData)
    $(formData).each(function(index, obj) {
      if (obj.value) {
        componentUpdates[obj.name] = obj.value
      }
    })
    $('.updateSystemComponent').remove()
    console.log(componentUpdates)
    putSystemComponent(componentUpdates)
    $('.updateSystemComponent').remove()
    getSystemComponents(displaySystemComponentGroupStatusScreen)
  })
}

function renderAddReadingScreen(systemComponent, user = null) {
  return `
  <form class="addReadingForm" data-id="${systemComponent.id}">
    <fieldset>
      <legend>Add A Device Reading for "${systemComponent.id}":</legend>
      <input type="text" name="temperature" id="temperature" placeholder="Temperature">
      <input type="submit" value="UPDATE" id="submit"></input>
    </fieldset>
  </form>
  `
}

function handleAddReadingFormSubmit() {
  $('main').on('submit', '.addReadingForm', function(event) {
    event.preventDefault()
    //    const formData = $( ":input" ).serializeArray()
    const componentUpdate = {
      id: $(event.currentTarget).data('id'),
      reading: {
        temperature: $('#temperature').val(),
        date: Date.now()
      }
    }
    $('.addReading').remove()
    console.log('component updates for readings...')
    console.log(componentUpdate)
    putSystemComponent(componentUpdate, getAndDisplaySystemComponentGroupStatusScreen)
  })
}

function displayUpdateComponentScreen(systemComponent) {
  $('main').append(renderUpdateComponentScreen(systemComponent))
}

function handleEditComponentButton() {
  $('main').on('click', '.editComponentButton', function(event) {
    const id = $(event.currentTarget).data('id')
    getSystemComponentById(id, displayUpdateComponentScreen)
  })
}

function displayAddReadingScreen(systemComponent) {
  $('main').append(renderAddReadingScreen(systemComponent))
}

function handleAddReadingButton() {
  $('main').on('click', '.addReadingButton', function(event) {
    const id = $(event.currentTarget).data('id')
    getSystemComponentById(id, displayAddReadingScreen)
  })
}

function handleDeleteComponentButton() {
  $('main').on('click', '.deleteComponentButton', function(event) {
    const id = $(event.currentTarget).data('id')
    const systemComponent = { id }
    deleteSystemComponent(systemComponent, getAndDisplaySystemComponentGroupStatusScreen)
  })
}

function handleLogout() {
  $('nav').on('click', '#logout', function(event) {
    user = null
    renderNavigation()
    getSystemComponents(displaySystemComponentGroupStatusScreen)
  })
}

function setupEventHandlers() {
  console.log("Running Event Handlers...")
  handleAddComponentShow()
  handleAddComponentFormSubmit()
  handleUpdateComponentShow()
  handleUpdateComponentFormSubmit()
  handleAddReadingButton()
  handleAddReadingFormSubmit()
  handleEditComponentButton()
  handleDeleteComponentButton()
  handleRegistershow()
  handleRegisterFormSubmit()
  handleLogInshow()
  handleLogInFormSubmit()
}

function apiFailure(error) {
  console.log("API Failure")
  console.error(error)
}

function addUser(userData, callback) {
  console.log("running addUser...")
  const settings = {
    url: '/api/users',
    data: JSON.stringify(userData),
    contentType: 'application/json',
    dataType: 'json',
    type: 'POST',
    success: function(data) {
      console.log("new user added!")
      callback(data)
    },
    failure: apiFailure
  }
  $.ajax(settings)
}

function loginUser(userData, callback) {
  console.log("attempting login...")
  const settings = {
    url: '/api/auth/login',
    data: JSON.stringify(userData),
    contentType: 'application/json',
    dataType: 'json',
    type: 'POST',
    success: function(data) {
      console.log(data)
      console.log("login successful!")
      $('.login').remove()
      jwt = data.authToken
      callback()
    },
    failure: function(data) {
      console.log("login failed.")
      console.log(userData)
      $('.login').remove()
      apiFailure
    }
  }
  $.ajax(settings)
}

function getAndDisplaySystemComponentGroupStatusScreen() {
  getSystemComponents(displaySystemComponentGroupStatusScreen)
}

function getSystemComponentById(id, callback) {
  const settings = {
    url: `${SYSTEMCOMPONENTURL}/${id}`,
    dataType: 'json',
    type: 'GET',
    success: function(data) {
      callback(data, jwt)
    },
    failure: apiFailure
  }
  $.ajax(settings)}

function getSystemComponents(callback) {
  const settings = {
    url: SYSTEMCOMPONENTURL,
    dataType: 'json',
    type: 'GET',
    success: function(data) {
      callback(data.systemComponents, jwt)
    },
    failure: apiFailure
  }
  $.ajax(settings)
}

function postSystemComponent(systemComponent, callback) {
  const settings = {
    url: SYSTEMCOMPONENTURL,
    data: JSON.stringify(systemComponent),
    contentType: 'application/json',
    dataType: 'json',
    type: 'POST',
    success: function(data) {
      callback(data, jwt)
    },
    failure: apiFailure
  }
  if (jwt) {
    settings.headers = {Authorization: `Bearer ${jwt}`}
  }
  $.ajax(settings)
}

function putSystemComponent(systemComponent, callback) {
  const settings = {
    url: `${SYSTEMCOMPONENTURL}/${systemComponent.id}`,
    data: JSON.stringify(systemComponent),
    contentType: 'application/json',
    dataType: 'json',
    type: 'PUT',
    success: function(data) {
      callback(data, jwt)
    },
    failure: apiFailure
  }
  if (jwt) {
    settings.headers = {Authorization: `Bearer ${jwt}`}
  }
  $.ajax(settings)
}

function deleteSystemComponent(systemComponent, callback) {
  const settings = {
    url: `${SYSTEMCOMPONENTURL}/${systemComponent.id}`,
    dataType: 'json',
    type: 'DELETE',
    success: function(data) {
      callback(data, jwt)
    },
    failure: apiFailure
  }
  if (jwt) {
    settings.headers = {Authorization: `Bearer ${jwt}`}
  }
  console.log(`Deleting ${systemComponent.id}`)
  $.ajax(settings)
}

function initializeUI() {
  setupEventHandlers()
  getAndDisplaySystemComponentGroupStatusScreen()
}

$(initializeUI)
console.log("Loaded.")

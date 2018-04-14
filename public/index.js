const SYSTEMCOMPONENTURL = '/api/systemcomponent'
let jwt

function StorageException(message) {
  this.message = message
  this.name = "StorageException"
}

function renderNavigation(user = null){
  return `<ul>
    ${!user? `<li>
      <a id="login">Log In</a>
    </li>
    <li>
      <a id="register">Register</a>
    </li>`: `<li>
      <a id="logout">Log Out</a>
    </li>`}
    ${user? `<li>
      <a id="status" href="#componentGroupArea">Status</a>
      <a id="addSystemComponent">Add Component</a>
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
  const greenBackgroundColor = "rgba(70, 191, 189, 0.2)"
  const greenBorderColor = "rgb(70, 191, 189)"
  const redBackgroundColor = "rgba(247, 70, 74, 0.2)"
  const redBorderColor = "rgb(247, 70, 74)"
  const blueBorderColor = "rgb(54, 162, 235)"
  const blueBackgroundColor = "rgba(54, 162, 235, 0.2)"
  const nameLabels = systemComponents.map(function(systemComponent) {
    return systemComponent.name
  })
  const thresholdTemperatureData = systemComponents.map(function(systemComponent) {
    return systemComponent.safeTempThreshold
  })
  const currentTemperatureData = systemComponents.map(function(systemComponent) {
    if (systemComponent.readings.length) {
     return systemComponent.readings[systemComponent.readings.length - 1].temperature
   }
  })
  const temperatureBackgroundColor = systemComponents.map(function(systemComponent) {
    if (systemComponent.readings.length) {
      if (systemComponent.readings[systemComponent.readings.length - 1].temperature >= systemComponent.safeTempThreshold) {
       return redBackgroundColor
     }
     else {
       return greenBackgroundColor
     }
    }
  })
  const temperatureBorderColor = systemComponents.map(function(systemComponent) {
    if (systemComponent.readings.length) {
      if (systemComponent.readings[systemComponent.readings.length - 1].temperature >= systemComponent.safeTempThreshold) {
       return redBorderColor
     }
     else {
       return greenBorderColor
     }
    }
  })
  const tempThresholdBorderColor = systemComponents.map(function(systemComponent) {
    return blueBorderColor
  })
  const tempThresholdBackgroundColor = systemComponents.map(function(systemComponent) {
    return blueBackgroundColor
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
      "data": thresholdTemperatureData,
      "fill": false,
      "backgroundColor": tempThresholdBackgroundColor,
      "borderColor": tempThresholdBorderColor,
      "borderWidth": 1
    }, {
      "label": "Current Temperature (℃)",
      "data": currentTemperatureData,
      "fill": false,
      "backgroundColor": temperatureBackgroundColor,
      "borderColor": temperatureBorderColor,
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
        text: 'System Component Operations Status'
      },
      tooltips: {
        mode: 'index',
        intersect: true
      },
      scales: {
        yAxes: [{
          scaleLabel: {
           display: true,
           labelString: "Temperature (℃)",
          },
          ticks: {
            min: -100,
            max: 100
          }
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
    labels: systemComponent.readings.map(function(reading) {
      return reading.date
    }),
    datasets: [{
      fill: false,
      label: 'Reading',
      //      data: [20, 25, 34],
      // code below is not working, using hard-coded values instead
      data: systemComponent.readings.map(function(reading) {
        return reading.temperature
      }),
      borderColor: 'rgb(54, 162, 235)',
      backgroundColor: 'rgb(54, 162, 235)',
      lineTension: 0,
    }, {
      fill: false,
      label: 'Threshold',
      data: systemComponent.readings.map(function(reading) {
        return systemComponent.safeTempThreshold
      }),
      borderColor: 'rgb(247, 70, 74)',
      backgroundColor: 'rgb(247, 70, 74)'
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
            labelString: 'Temperature (℃)',
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
    'value': 'EDIT',
    'text': 'EDIT'
  })
  const addReadingButton = $('<button></button>', {
    'class': 'addReadingButton',
    'data-id': `${systemComponent.id}`,
    'value': 'ADD READING',
    'text': 'ADD READING'
  })
  const deleteButton = $('<button></button>', {
    'class': 'deleteComponentButton',
    'data-id': `${systemComponent.id}`,
    'value': 'DELETE',
    'text': 'DELETE'
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
  return `<form class="registerForm overlay-content">
    <fieldset>
      <legend>Register:</legend>
      <input type="text" name="firstName" id="firstName" placeholder="First Name" required>
      <input type="text" name="lastName" id="lastName" placeholder="Last Name" required>
      <input type="text" name="username" id="username" placeholder="User ID" required>
      <input type="text" name="password" id="password" placeholder="Password" required>
      <input type="submit" value="SUBMIT" id="submit"></input>
      <button type="button" id="cancelButton">CANCEL</button>
    </fieldset>
  </form>`
}

function renderLogInScreen() {
  return `<form class="logInForm overlay-content">
    <fieldset>
      <legend>Log In:</legend>
      <input type="text" name="username" id="username" placeholder="username" required>
      <input type="text" name="password" id="password" placeholder="password" required>
      <input type="submit" value="SUBMIT" id="submit"></input>
      <button type="button" id="cancelButton">CANCEL</button>
    </fieldset>
  </form>`
}

function handleRegistershow() {
  console.log("Waiting for someone to click the register item...")
  $('nav').on('click', '#register', function(event) {
    $('main').append(`
      <div id="registrationForm" class="register overlay">
      <a href="javascript:void(0)" class="closebtn" onclick="closeNav()">&times;</a>
      </div>`)
    $('.register').html(renderRegisterScreen())
    document.getElementById("registrationForm").style.height = "100%"
  })
}

function handleLogInshow() {
  console.log("Waiting for someone to click the log in item...")
  $('nav').on('click', '#login', function(event) {
    $('main').append(`
      <div id="loginForm" class="login overlay">
      <a href="javascript:void(0)" class="closebtn" onclick="closeNav()">&times;</a>
      </div>`)
    $('.login').html(renderLogInScreen())
    document.getElementById("loginForm").style.height = "100%"
  })
}

// Loop which joins all system components in the model as LIs in a UL and displays it
function renderSystemComponentGroupStatusScreen(systemComponents, user = null) {
  console.log("Building System Component Group Status Screen...")
  console.log(`systemComponents: ${systemComponents}`)
  const systemComponentListItems = systemComponents.map(function(systemComponent) {
    return $('<li></li>').append(renderSystemComponent(systemComponent))
  })
  const systemComponentList = $('<ul></ul>').append(systemComponentListItems)
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
      <div id="addSystemComponentForm" class="addSystemComponent overlay">
      <a href="javascript:void(0)" class="closebtn" onclick="closeNav()">&times;</a>
      </div>`)
    $('.addSystemComponent').html(renderAddComponentScreen())
    document.getElementById("addSystemComponentForm").style.height = "100%"
  })
}

function renderAddComponentScreen(user = null) {
  return `
  <form class="addSystemComponentForm overlay-content">
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
      <button type="button" id="cancelButton">CANCEL</button>
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

function renderUpdateComponentScreen(systemComponent, user = null) {
  return `
  <form class="updateSystemComponentForm overlay-content" data-id="${systemComponent.id}">
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
      <button type="button" id="cancelButton">CANCEL</button>
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
    $('.register').remove()
    addUser(registerData, getAndDisplaySystemComponentGroupStatusScreen)
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
    $('.logInForm').remove()
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
    console.log(componentUpdates)
    $('.updateSystemComponentForm').remove()
    putSystemComponent(componentUpdates, getAndDisplaySystemComponentGroupStatusScreen)
  })
}

function renderAddReadingScreen(systemComponent, user = null) {
  return `
  <form class="addReadingForm overlay-content" data-id="${systemComponent.id}">
    <fieldset>
      <legend>Add A Device Reading for "${systemComponent.id}":</legend>
      <input type="text" name="temperature" id="temperature" placeholder="Temperature">
      <input type="submit" value="UPDATE" id="submit"></input>
      <button type="button" id="cancelButton">CANCEL</button>
    </fieldset>
  </form>
  `
}

function handleAddReadingFormSubmit() {
  $('main').on('submit', '.addReadingForm', function(event) {
    event.preventDefault()
    const componentUpdate = {
      id: $(event.currentTarget).data('id'),
      readings: {
        temperature: $('#temperature').val(),
        date: Date.now()
      }
    }
    console.log('component updates for readings...')
    console.log(componentUpdate)
    $('.addReading').remove()
    putSystemComponent(componentUpdate, getAndDisplaySystemComponentGroupStatusScreen)
  })
}

function displayUpdateComponentScreen(systemComponent) {
  $('main').append(`
    <div id="updateComponentForm" class="updateSystemComponent overlay">
    <a href="javascript:void(0)" class="closebtn" onclick="closeNav()">&times;</a>
    </div>`)
  $('.updateSystemComponent').html(renderUpdateComponentScreen(systemComponent))
  document.getElementById("updateComponentForm").style.height = "100%"
}

function handleEditComponentButton() {
  $('main').on('click', '.editComponentButton', function(event) {
    const id = $(event.currentTarget).data('id')
    getSystemComponentById(id, displayUpdateComponentScreen)
  })
}

function displayAddReadingScreen(systemComponent) {
  $('main').append(`
    <div id="addReadingForm" class="addReading overlay">
    <a href="javascript:void(0)" class="closebtn" onclick="closeNav()">&times;</a>
    </div>`)
  $('.addReading').append(renderAddReadingScreen(systemComponent))
  document.getElementById("addReadingForm").style.height = "100%"
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
    console.log("Logging out...")
    user = null
    jwt = null
    displayNavigation()
    $('#componentGroupArea').empty()
  })
}

function handleCancelButton() {
  $('main').on('click', '#cancelButton', function(event) {
    $(this).closest('div').remove()
    getAndDisplaySystemComponentGroupStatusScreen()
  })
}

function setUpSocketListener() {
  const socket = io()
  socket.on('Components Updated', getAndDisplaySystemComponentGroupStatusScreen)
}

function setupEventHandlers() {
  console.log("Running Event Handlers...")
  handleRegistershow()
  handleRegisterFormSubmit()
  handleLogInshow()
  handleLogInFormSubmit()
  handleAddComponentShow()
  handleAddComponentFormSubmit()
  handleEditComponentButton()
  handleUpdateComponentFormSubmit()
  handleAddReadingButton()
  handleAddReadingFormSubmit()
  handleDeleteComponentButton()
  handleLogout()
  handleCancelButton()
}

function apiFailure(error) {
  console.log("API Failure")
  console.error(error)
}

function addUser(userData, callback) {
  console.log("running addUser...")
  const settings = {
    url: '/api/user',
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
//      console.log("login failed.")
//      console.log(userData)
//      $('.login').append('<section>You have entered an invalid username or password.</section>')
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
  setUpSocketListener()
  getAndDisplaySystemComponentGroupStatusScreen()
}

$(initializeUI)
console.log("Loaded.")

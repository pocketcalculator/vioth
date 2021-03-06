const SYSTEMCOMPONENTURL = '/api/systemcomponent'
let jwt

function StorageException(message) {
  this.message = message
  this.name = "StorageException"
}

function renderNavigation(user = null){
  return `<ul class="topnav" id="myTopnav">
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
        </li>
        <li>
          <a id="addSystemComponent">Add Component</a>
    </li>`: ''}
    <li class="icon">
      <a href="javascript:void(0);" style="color:#fe8723;font-size:24px;" onclick="mobileMenuRender()">&#9776;</a>
    </li>
  </ul>`
}

function mobileMenuRender() {
    const x = document.getElementById("myTopnav");
    if (x.className === "topnav") {
        x.className += " responsive";
    } else {
        x.className = "topnav";
    }
}

function displayNavigation(user = null) {
  $('nav').html(renderNavigation(user))
}

function displaySystemSummaryChart(systemComponents) {
  $('.systemSummaryChartArea').html(drawSystemSummaryChart(systemComponents))
  $('.systemSummaryChartArea').append('<ol id="accessibilityList" aria-live="assertive"></ol>')
  const accessibilityComponentList = []
  systemComponents.forEach(function(component, index) {
    const lastReading = component.readings[component.readings.length - 1]
    const accessibilityComponentListString = `<li>${component.name} status, safe temperature threshold: ${component.safeTempThreshold}${lastReading?`, last reading: ${lastReading.temperature}`:''}</li>`
    accessibilityComponentList.push(accessibilityComponentListString)
  })
  $('#accessibilityList').html(accessibilityComponentList.join('\n'))
}

// This function renders the systemSummary Chart.js graph
function drawSystemSummaryChart(systemComponents) {
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
      },
      responsiveAnimationDuration: {
        duration: 3000
      }
    }
  }
  const chart = new Chart(ctx, options)
  return ctx
}

// This function renders a Chart.js graph
function drawComponentGraph(systemComponent, user = null) {
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
            labelString: "Time",
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
      },
      responsiveAnimationDuration: {
        duration: 3000
      }
    }
  }
  const chart = new Chart(ctx, options)
  return ctx
}

function renderSystemComponent(systemComponent, user = null) {
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
  const graphWrapper = $('<div></div>', {
    'class': 'systemComponentGraphWrapper'
  })
  div.append(`<caption><section class="componentWindowName">${systemComponent.name}</section><section class="componentWindowId">${systemComponent.id}</section></caption>`)
  div.append(graphWrapper)
  const graph = drawComponentGraph(systemComponent)
  graphWrapper.append(graph)
  div.append(editButton)
  div.append(addReadingButton)
  div.append(deleteButton)
  return div
}

function renderRegisterScreen() {
  return `<div class="register overlay-content">
    <form class="registerForm">
      <fieldset>
        <legend>Register:</legend>
        <input type="text" name="firstName" id="firstName" placeholder="First Name" required>
        <input type="text" name="lastName" id="lastName" placeholder="Last Name" required>
        <input type="text" name="username" id="username" placeholder="Username" required>
        <input type="text" name="password" id="password" placeholder="Password" required>
        <input type="submit" value="SUBMIT" id="submit"></input>
        <button type="button" id="cancelButton">CANCEL</button>
      </fieldset>
    </form>
</div>`
}

function renderLogInScreen() {
  return `<div class="logIn overlay-content">
    <form class="logInForm">
      <fieldset>
        <legend>Log In:</legend>
        <section id="loginStatus"></section>
        <input type="text" name="username" id="username" placeholder="username" required>
        <input type="text" name="password" id="password" placeholder="password" required>
        <input type="submit" value="LOG IN" id="submit"></input>
        <button type="button" id="cancelButton">CANCEL</button>
      </fieldset>
    </form>
</div>`
}

function handleRegistershow() {
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
  return `<div class="addComponent overlay-content">
    <form class="addSystemComponentForm">
      <fieldset>
        <legend>Add A Device For Management:</legend>
        <input type="text" name="name" id="name" placeholder="Name" maxLength="12" required>
        <select name="isHuman" id="isHuman" required>
          <option value="">Human or Machine?</option>
          <option value="false">Machine</option>
          <option value="true">Human</option>
        </select>
        <input type="number" name="safeTempThreshold" id="safeTempThreshold" min="-100" max="100" placeholder="Safe Temperature Threshold" required>
        <input type="submit" value="ADD COMPONENT" id="submit"></input>
        <button type="button" id="cancelButton">CANCEL</button>
      </fieldset>
    </form>
  </div>`
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
  return `<div class="updateComponent overlay-content">
    <form class="updateSystemComponentForm" data-id="${systemComponent.id}">
      <fieldset>
        <legend>Modify "${systemComponent.name}"</legend>
        <input type="text" name="name" id="name" placeholder="Name" maxLength="12" value="${systemComponent.name}">
        <select name="isHuman" id="isHuman">
          <option value="">Human or Machine?</option>
          <option value="false"${systemComponent.isHuman ? '' : ' selected'}>Machine</option>
          <option value="true"${systemComponent.isHuman ? ' selected' : ''}>Human</option>
        </select>
        <input type="number" name="safeTempThreshold" id="safeTempThreshold" min="-100" max="100" placeholder="Safe Temperature Threshold" value="${systemComponent.safeTempThreshold}">
        <input type="submit" value="UPDATE COMPONENT" id="submit"></input>
        <button type="button" id="cancelButton">CANCEL</button>
      </fieldset>
    </form>
  </div>`
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
    $(formData).each(function(index, obj) {
      if (obj.value) {
        componentUpdates[obj.name] = obj.value
      }
    })
    $('.updateSystemComponent').remove()
    putSystemComponent(componentUpdates, getAndDisplaySystemComponentGroupStatusScreen)
  })
}

function renderAddReadingScreen(systemComponent, user = null) {
  return `<div class="addReading overlay-content">
    <form class="addReadingForm" data-id="${systemComponent.id}">
      <fieldset>
        <legend>Add Reading For "${systemComponent.name}":</legend>
        <input type="number" name="temperature" id="temperature" min="-100" max="100" placeholder="Temperature">
        <input type="submit" value="ADD READING" id="submit"></input>
        <button type="button" id="cancelButton">CANCEL</button>
      </fieldset>
    </form>
  </div>`
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
    user = null
    jwt = null
    displayNavigation()
    $('#componentGroupArea').empty()
  })
}

function handleCancelButton() {
  $('main').on('click', '#cancelButton', function(event) {
    $(this).closest('div').parent('div').remove()
    getAndDisplaySystemComponentGroupStatusScreen()
  })
}

function setUpSocketListener() {
  const socket = io()
  socket.on('Components Updated', getAndDisplaySystemComponentGroupStatusScreen)
}

function setupEventHandlers() {
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
  console.error(error)
}

function addUser(userData, callback) {
  const settings = {
    url: '/api/user',
    data: JSON.stringify(userData),
    contentType: 'application/json',
    dataType: 'json',
    type: 'POST',
    success: function(data) {
      callback(data)
    },
    error: apiFailure
  }
  $.ajax(settings)
}

function loginUser(userData, callback) {
  const settings = {
    url: '/api/auth/login',
    data: JSON.stringify(userData),
    contentType: 'application/json',
    dataType: 'json',
    type: 'POST',
    success: function(data) {
      $('.login').remove()
      jwt = data.authToken
      callback()
    },
    error: function(error) {
      $('#loginStatus').html('You have entered an invalid username or password.')
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
    error: apiFailure
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
    error: apiFailure
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
    error: apiFailure
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
    error: apiFailure
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
    error: apiFailure
  }
  if (jwt) {
    settings.headers = {Authorization: `Bearer ${jwt}`}
  }
  $.ajax(settings)
}

function initializeUI() {
  setupEventHandlers()
  setUpSocketListener()
  getAndDisplaySystemComponentGroupStatusScreen()
}

$(initializeUI)

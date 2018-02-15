function StorageException(message) {
  this.message = message
  this.name = "StorageException"
}

const systemComponent = {
  create: function(name, safeTempThreshold, isHuman) {
    console.log(`creating a new system component`)
    const item = {
      id: generateUuid(),
      name,
      installedDate: Date.now(),
      safeTempThreshold,
      isHuman,
      readings: []
    }
    this.items[item.id] = item
    return item
  },
  get: function() {
    console.log(`Retrieving system component list...`)
    return Object.keys(this.items).map(key => this.items[key])
  },
  delete: function(itemId) {
    console.log(`Deleting system component \`${itemId}\``)
    delete this.items[itemId]
  },
  update: function(updatedItem) {
    console.log(`Updating system component \`${itemId}\``)
    const {id} = updatedItem
    if (!(id in this.items)) {
      throw StorageException(`\`${id}\` doesn't exist`)
    }
    this.items[updatedItem.id] = updatedItem
    return updatedItem
  }
}

function createSystemComponent() {
  const storage = Object.create(systemComponent)
  storage.items = {}
  return storage
}

const SYSTEMCOMPONENTS = createSystemComponent()


function drawComponentGraph(systemComponent, user = null) {
  const ctx = $('<canvas/>',{
                   'class':'radHuh',
                    id: 'myCanvas'
                }).getContext('2d')
                 //document.getElementById(`${chartName}`).getContext('2d')
  const data = {
// Labels should be Date objects
    labels: systemComponent.readings.map(function(reading) {
      return reading.date
    }),
    datasets: [{
      fill: false,
      label: 'Temperature',
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

function renderHomeScreen(systemComponents, user = null) {
  return ''
}

function renderLoginScreen() {
  return ''
}

function renderSignUpScreen() {
  return ''
}

function renderComponentStatusScreen(systemComponent, user = null) {
  return ''
}

function renderAddComponentScreen(user = null) {
  const addSystemComponentForm = `
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
      <input type="text" name="tempReading1" id="tempReading1" placeholder="Temperature Reading 1">
      <input type="text" name="tempReading2" id="tempReading2" placeholder="Temperature Reading 2">
      <input type="text" name="tempReading3" id="tempReading3" placeholder="Temperature Reading 3">
      <input type="text" name="tempReading4" id="tempReading4" placeholder="Temperature Reading 4">
      <input type="text" name="tempReading5" id="tempReading5" placeholder="Temperature Reading 5">     
      <input type="submit" value="ADD" id="submit"></input>
    </fieldset>
  </form>
  `
  $('.addSystemComponent').html(addSystemComponentForm)
  handleAddComponentButton()
}

function renderUpdateComponentScreen(systemComponent, user = null) {
  return ''
}

function renderAddReading(systemComponent, user = null) {
  return ''
}

function handleAddComponent() {
  console.log("waiting for someone to click the add component item...")
  $('#addSystemComponent').click(function(event) {
    renderAddComponentScreen()
  })
}

function handleAddComponentButton() {
  $('.addSystemComponentForm').submit(function(event){
    event.preventDefault()
    let newComponent = {
      name,
      isHuman,
      safeTempThreshold,
      readings: {
        temperature: [],
        time: []
      }
    }
    newComponent.name = $('#name').val()
    newComponent.isHuman = $('#isHuman').val()
    newComponent.safeTempThreshold = $('#safeTempThreshold').val()
    newComponent.readings.temperature.push($('#tempReading1').val())
    newComponent.readings.time.push(Date.now())
    console.log(newComponent)
    return newComponent
  })
}

handleAddComponent()

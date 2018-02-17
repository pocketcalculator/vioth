/**
 * Code to generate a v4 UUID
 */
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


function StorageException(message) {
  this.message = message
  this.name = "StorageException"
}

const SYSTEMCOMPONENTS = {
  create: function (name, safeTempThreshold, isHuman) {
    console.log(`creating a new system component`)
    const item = {
      name,
      isHuman,
      safeTempThreshold,
      deviceId: generateUuid(),
      installedDate: Date.now(),
      readings: [{
          temperature: 10,
          date: Date.now()
        },
        {
          temperature: 11,
          date: Date.now()
        }
      ]
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
    delete this.items.find(function(item){
      return itemId == item.id
    })
  },
  update: function (updatedItem) {
    console.log(`Updating system component \`${itemId}\``)
    const {
      id
    } = updatedItem
    const index = this.items.findIndex(function(item){
      return id == item.id
    })
    if (id < 0) {
      throw StorageException(`\`${id}\` doesn't exist`)
    }
    this.items[index] = updatedItem
    return updatedItem
  },
  items: []
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
  labels: systemComponent.readings.map(function (reading) {
      return reading.date
    }),
    datasets: [{
      fill: false,
      label: 'Temperature',
//      data: [20, 25, 34],
// code below is not working, using hard-coded values instead
      data: systemComponent.readings.map(function (reading) {
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
    id: '${systemComponent.name}-div'
  })
  div.append(`<caption>${systemComponent.name} ${systemComponent.deviceId}</caption>`)
  const graph = drawComponentGraph(systemComponent)
  div.append(graph)
  return div
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

// This will be a loop which joins all device components in the model as LIs in a UL and displays it
function renderSystemComponentGroupStatusScreen(systemComponents, user = null) {
  console.log("Building System Component Group Status Screen...")
  const systemComponentListItems = systemComponents.map(function(systemComponent) {
    return $('<li></li>').append(renderSystemComponent(systemComponent))
  })
  const systemComponentList = $('<ul></ul>').append(systemComponentListItems)
// should not be doing appends within the render functions, just spit out text  
  $('main').html(systemComponentList)
}

function handleAddComponentShow() {
  console.log("waiting for someone to click the add component item...")
  $('nav').on('click', '#addSystemComponent', function (event) {
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
  $('main').on('submit', '.addSystemComponentForm', function (event) {
    event.preventDefault()
    SYSTEMCOMPONENTS.create($('#name').val(), $('#safeTempThreshold').val(), $('#isHuman').val())
    $('.addSystemComponent').remove()
    console.log(SYSTEMCOMPONENTS.get())
    renderSystemComponentGroupStatusScreen(SYSTEMCOMPONENTS.get())
  })
}

function handleUpdateComponentShow() {
  console.log("waiting for someone to click the update component item...")
  $('nav').on('click', '#updateSystemComponent', function (event) {
    $('main').append(`
      <div class="updateSystemComponent">
      </div>`)
    $('.updateSystemComponent').html(renderUpdateComponentScreen())
  })
}

function renderUpdateComponentScreen(systemComponent, user = null) {
  return `
  <form class="UpdateSystemComponentForm">
    <fieldset>
      <legend>Modify A Device:</legend>
      <input type="text" name="id" id="id" placeholder="Device ID" required>
      <input type="text" name="name" id="name" placeholder="Name" required>
      <select name="isHuman" id="isHuman" required>
        <option value="">Human or Machine?</option>
        <option value="false">Machine</option>
        <option value="true">Human</option>
      </select>
      <input type="text" name="safeTempThreshold" id="safeTempThreshold" placeholder="Safe Temperature Threshold" required>
      <input type="text" name="reading1" id="reading1" placeholder="Reading 1">
      <input type="text" name="reading2" id="reading2" placeholder="Reading 2">
      <input type="text" name="reading3" id="reading3" placeholder="Reading 3">
      <input type="text" name="reading4" id="reading4" placeholder="Reading 4">
      <input type="text" name="reading5" id="reading5" placeholder="Reading 5">
      <input type="submit" value="UPDATE" id="submit"></input>
    </fieldset>
  </form>
  `
}

function handleUpdateComponentFormSubmit() {
  $('main').on('submit', '.updateSystemComponentForm', function (event) {
    event.preventDefault()
    SYSTEMCOMPONENTS.update($('#id').val(), $('#name').val(), $('#safeTempThreshold').val(), $('#isHuman').val(), $('#reading1').val())
//    $('.updateSystemComponent').remove()
    console.log(SYSTEMCOMPONENTS.get())
    renderSystemComponentGroupStatusScreen(SYSTEMCOMPONENTS.get())
  })
}

function renderAddReading(systemComponent, user = null) {
  return ''
}

function setupEventHandlers() {
  console.log("Running Event Handlers...")
  handleAddComponentShow()
  handleAddComponentFormSubmit()
  handleUpdateComponentShow()
  handleUpdateComponentFormSubmit()
}

$(setupEventHandlers)
console.log("Loaded.")
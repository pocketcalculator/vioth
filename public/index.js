/**
 * Convert a number or array of integers to a string of padded hex octets.
 */
function asHex(value: Array<number> | Uint8Array): string {
  return Array.from(value).map(i => ('00' + i.toString(16)).slice(-2)).join('');
}

/**
 * Attempt to securely generate random bytes/
 */
function getRandomBytes(size: number): Array<number> | Uint8Array {
  // SPRNG
  if ((typeof Uint8Array == 'function') && window.crypto) {
    let buffer = new Uint8Array(size);
    return window.crypto.getRandomValues(buffer);
  }

  // Insecure random
  return Array.from(new Array(size), () => Math.random() * 255 | 0);
}

/**
 * Generate a RFC4122-compliant v4 UUID.
 *
 * @see http://www.ietf.org/rfc/rfc4122.txt
 */
export function generateUuid(): string {
  const version = 0b01000000;
  const clockSeqHiAndReserved = getRandomBytes(1);
  const timeHiAndVersion = getRandomBytes(2);

  clockSeqHiAndReserved[0] &= 0b00111111 | 0b10000000;
  timeHiAndVersion[0] &= 0b00001111 | version;

  return [
    asHex(getRandomBytes(4)),     // time-low
    '-',
    asHex(getRandomBytes(2)),     // time-mid
    '-',
    asHex(timeHiAndVersion),      // time-high-and-version
    '-',
    asHex(clockSeqHiAndReserved), // clock-seq-and-reserved
    asHex(getRandomBytes(1)),     // clock-seq-loq
    '-',
    asHex(getRandomBytes(6))      // node
  ].join('');
}


function StorageException(message) {
  this.message = message
  this.name = "StorageException"
}

const systemComponent = {
  create: function(name, safeTempThreshold, isHuman) {
    console.log(`creating a new system component`)
    const item = {
      id: generateUuid(),
      name: name,
      installedDate: Date.now(),
      safeTempThreshold: safeTempThreshold,
      isHuman: isHuman,
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


function drawSummaryGraph(chartName) {
  const ctx = document.getElementById(`${chartName}`).getContext('2d')
  const data = {
// Labels should be Date objects
    labels: [new Date(2017, 08, 16), new Date(2017, 08, 17), new Date(2017, 08, 18)],
    datasets: [{
      fill: false,
      label: 'Temperature',
      data: [28, 25, 34],
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
}
drawSummaryGraph('systemStatusChart')
drawSummaryGraph('device1StatusChart')
drawSummaryGraph('device2StatusChart')
drawSummaryGraph('device3StatusChart')

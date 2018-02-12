const uuid = require('uuid')

// this module provides volatile storage for our systemComponent model.

function StorageException(message) {
  this.message = message
  this.name = "StorageException"
}

const systemComponent = {
  create: function(name, safeTempThreshold, isHuman) {
    console.log(`creating a new system component`)
    const item = {
      id: uuid.v4(),
      name: name,
      installedDate: Date.now(),
      safeTempThreshold: safeTempThreshold,
      isHuman: isHuman
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

module.exports = {
  systemComponent: createSystemComponent()
}

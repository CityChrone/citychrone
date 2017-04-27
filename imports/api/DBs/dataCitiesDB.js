
export let dataCitiesDB = new FS.Collection("dataCitiesDB", {
  stores: [new FS.Store.FileSystem("plain/text")],
});
 
export function saveRouteRecord(state) {
  saveRouteRecordList(state.routeRecordList);
  saveActiveRouteName(state.activeRouteName);
}

function saveRouteRecordList(routeRecordList) {
  const data = routeRecordList.map(
    ({ fullPath, name, meta, params, path, query, hash }) => {
      return { fullPath, name, meta, params, path, query, hash };
    }
  );
  sessionStorage.setItem("routeRecordList", JSON.stringify(data));
}

function saveActiveRouteName(activeRouteName) {
  sessionStorage.setItem("activeRouteName", activeRouteName);
}
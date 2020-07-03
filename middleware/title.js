export default ({ route, store }) => {
    const title = route.meta.reduce((title, meta) => meta.title || title, undefined);
    store.commit('SET_TITLE', title);
}

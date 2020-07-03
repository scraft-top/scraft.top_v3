const state: any = () => {
  title: undefined
};

const mutations = {
  SET_TITLE (state: any, title: string) {
    state.title = title;
    console.log(state.title);
  }
}

export default {
  state,
  mutations
}

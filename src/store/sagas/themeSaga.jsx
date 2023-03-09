function* themeSaga({ payload }) {

    localStorage.setItem('theme', payload);
}

export default themeSaga

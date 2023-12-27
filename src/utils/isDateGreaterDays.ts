export default (d1: Date, d2: Date, days: number) => {
	d1 = new Date(d1);
	return +new Date(d2) > d1.setDate(d1.getDate() + (days || 0));
};

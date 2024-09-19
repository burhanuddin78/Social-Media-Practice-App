import React, { useEffect } from 'react';

function Index({ user, userFollowStats }) {
	useEffect(() => {
		document.title = `Welcome to ${user.name.split(' ')[0]}`;
	}, []);

	return <div>Home</div>;
}

export default Index;

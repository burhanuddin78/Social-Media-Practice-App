import React from 'react';
import { Menu, Container, Icon } from 'semantic-ui-react';
import { useRouter } from 'next/router';
import Link from 'next/link';

function Navbar() {
	const router = useRouter();
	const IsActive = (route) => router.pathname === route;
	return (
		<Menu
			fluid
			borderless>
			<Container text>
				<Link href='/login'>
					<Menu.Item
						header
						active={IsActive('/login')}>
						<Icon
							size='large'
							name='sign in'
						/>
						Login
					</Menu.Item>
				</Link>

				<Link href='/signup'>
					<Menu.Item
						header
						active={IsActive('/signup')}>
						<Icon
							size='large'
							name='signup'
						/>
						signup
					</Menu.Item>
				</Link>
			</Container>
		</Menu>
	);
}

export default Navbar;

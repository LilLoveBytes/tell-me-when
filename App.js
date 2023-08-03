import { StatusBar } from "expo-status-bar";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import BoardScreen from "./app/components/BoardScreen";
import UsersBoards from "./app/screens/UsersBoards";
import Login from "./app/screens/Login";
import UserHomeScreen from "./app/screens/UserHomeScreen";
import Calendar from "./app/screens/Calendar";
import ListScreen from "./app/screens/ListScreen";
import { useState } from "react";

const Stack = createNativeStackNavigator();

export default function App() {
	const [authenticated, setAuthenticated] = useState(false);

	return (
		<NavigationContainer>
			<Stack.Navigator initialRouteName="Login">
				<Stack.Screen name="Login" component={Login} />
				<Stack.Screen name="Home" component={UserHomeScreen} />
				<Stack.Screen name="Users Boards" component={UsersBoards} />
				<Stack.Screen name="Calendar" component={Calendar} />
				<Stack.Screen name="Board" component={BoardScreen} />
				<Stack.Screen name="List" component={ListScreen} />
			</Stack.Navigator>
		</NavigationContainer>
	);
}

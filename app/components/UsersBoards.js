import {
	View,
	Text,
	Button,
	TextInput,
	StyleSheet,
	FlatList,
	Pressable,
	KeyboardAvoidingView,
	SafeAreaView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { getDocs, addDoc, collection, query, where, deleteDoc, doc } from "firebase/firestore";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../../firebaseConfig";
import tw from "twrnc";
import ModalBox from "./ModalBox";
import DatePickerModal from "./DatePickerModal";

const UsersBoards = ({ navigation }) => {
	const [userBoards, setUserBoards] = useState([]);
	const [board, setBoard] = useState({ title: "", description: "" });
	const [modalVisible, setModalVisible] = useState(false);
	const auth = FIREBASE_AUTH;

	// to get all boards associated with a userID
	useEffect(() => {
		const getUserBoards = async () => {
			try {
				const userId = auth.currentUser.uid;
				const userBoardsCollection = collection(
					FIRESTORE_DB,
					"users",
					userId,
					"boards"
				);
				const q = query(userBoardsCollection);
				const querySnapshot = await getDocs(q);

				const userBoards = [];
				querySnapshot.forEach((doc) => {
					const { title, description } = doc.data();
					userBoards.push({ id: doc.id, title, description });
				});
				setUserBoards(userBoards);
				console.log("user boards:", userBoards);
			} catch (error) {
				console.log("error fetching user boards:", error);
			}
		};
		getUserBoards();
	}, []);

	//to delete a board and associate lists and tasks
	const deleteBoard = async (boardId) => {
		try {
			const listCollection = collection(FIRESTORE_DB, "list");
			const qList = query(listCollection, where("boardId", "==", boardId));
			const querySnapshotList = await getDocs(qList);
			querySnapshotList.forEach(async (doc) => {
				await deleteDoc(doc.ref);
			});
			console.log("list on board", boardId, "deleted");

			const qTask = query(listCollection, where("boardId", "==", boardId));
			const querySnapshotTask = await getDocs(qTask);
			querySnapshotTask.forEach(async (doc) => {
				await deleteDoc(doc.ref);
			});
			console.log("task on board", boardId, "deleted");

			const userId = auth.currentUser.uid;
			const boardToDelete = doc(
				FIRESTORE_DB,
				"users",
				userId,
				"boards",
				boardId
			);
			await deleteDoc(boardToDelete);
			setUserBoards(userBoards.filter((board) => board.id !== boardId));
			console.log("board deleted", boardId);
		} catch (error) {
			console.log("error deleting board or list and tasks on list", error);
		}
	};

	// to create a new board associated with a userID
	const newBoard = async () => {
		try {
			const userId = auth.currentUser.uid;
			const userBoardsCollection = collection(
				FIRESTORE_DB,
				"users",
				userId,
				"boards"
			);
			await addDoc(userBoardsCollection, {
				title: board.title,
				description: board.description,
			});
			setUserBoards(() => [
				...userBoards,
				{ id: board.id, title: board.title, description: board.description },
			]);
			setBoard({ title: "", description: "" });
			console.log("Board created", id, title, description);
		} catch (error) {
			console.log("Error creating board:", error);
		}
	};

	// to render each board clickable on page
	// clicking board title opens that board
	const renderItems = ({ item }) => {
		const handlePress = () => {
			navigation.navigate("Board", {
				boardId: item.id,
				title: item.title,
				description: item.description,
			});
		};
		return (
			<Pressable onPress={handlePress}>
				<View style={tw`pt-5`}>
					<View
						style={tw`w-full text-center flex items-stretch flex-column gap-1 border-double border-white border-2`}
					>
						<Text style={tw`p-1 flex-1 text-white text-lg text-center`}>
							{" "}
							{item.title}
						</Text>
						<Text style={tw`p-2 flex-2 text-white text-xs text-center italic`}>
							{" "}
							description: {item.description}
						</Text>
						<Pressable
							onPress={() => {
								deleteBoard(item.id);
							}}
						>
							<Text style={tw`text-xs text-blue-900 pt-1`}> Delete Board </Text>
						</Pressable>
					</View>
				</View>
			</Pressable>
		);
	};

	return (
		<View style={tw`flex-1  bg-black`}>
			<SafeAreaView>
				<View
					style={tw`text-center flex items-center flex-column gap-1 opacity-70`}
				>
					<Text style={tw`text-white text-2xl text-center pt-4 underline`}>
						{" "}
						ALL BOARDS{" "}
					</Text>
      

					{/* button to create a new board */}
					<View style={tw`border-2 border-white`}>
						<Button
							style={tw`border-white border-2`}
							title="add new board"
							color="blue"
							onPress={() => {
								setModalVisible();
							}}
						/>
					</View>
					<ModalBox
						isOpen={modalVisible}
						closeModal={() => setModalVisible(false)}
						title="Create New Board"
						description="Please enter board details."
						content={
							<>
								<TextInput
									placeholder="Board Title"
									value={board.title}
									onChangeText={(text) => setBoard({ ...board, title: text })}
								/>
								<TextInput
									placeholder="Board Description"
									value={board.description}
									onChangeText={(text) =>
										setBoard({ ...board, description: text })
									}
								/>
								<Pressable
									onPress={() => {
										newBoard();
										setModalVisible(false);
									}}
								>
									<Text>Add Board</Text>
								</Pressable>
							</>
						}
					/>
				</View>

				<View style={tw`flex-row items-center  my-4`}>
					<View
						style={tw`flex-column flex-1 pt-1 opacity-90 w-96 items-stretch justify-center`}
					>
						{/* list of all users boards */}
						<View style={tw`m-12`}>
							<FlatList data={userBoards} renderItem={renderItems} />
						</View>
					</View>
				</View>
			</SafeAreaView>
		</View>
	);
};

export default UsersBoards;

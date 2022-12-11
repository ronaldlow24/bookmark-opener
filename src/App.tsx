import { useState } from "react";
import Modal from "react-modal";

const modalCustomStyles = {
    content: {
        top: "50%",
        left: "50%",
        right: "auto",
        bottom: "auto",
        marginRight: "-50%",
        transform: "translate(-50%, -50%)",
    },
};

type BookmarkListType = {
    id: string;
    title: string;
    bookmarks: BookmarkType[];
};

type BookmarkType = {
    id: string;
    title: string;
    url: string;
};

type ModalComponentType = {
    modalIsOpen: boolean;
    modalMode: ModalMode;
    closeModal: () => void;
    bookmarkList?: BookmarkListType;
};

const ModalAddMode = "ADD";
const ModalEditMode = "EDIT";
const DefaultModalMode = ModalAddMode;
type ModalMode = typeof ModalAddMode | typeof ModalEditMode;

const ModalComponent: React.FC<ModalComponentType> = ({
    modalIsOpen,
    modalMode,
    closeModal,
    bookmarkList,
}) => {
    const addBookmarkList = (title: string, bookmarks: BookmarkType[]) => {
        //get uuid
        const id = generateUUID();
        setBookmarks((prev) => [...prev, { id, title, bookmarks }]);
    };

    const removeBookmarkList = (id: string) => {
        setBookmarks((prev) => prev.filter((bookmark) => bookmark.id !== id));
    };

    const openBookmarkList = (id: string) => {
        const bookmarkList = bookmarks.find((bookmark) => bookmark.id === id);
        if (!bookmarkList) return;

        //open link in new tab
        bookmarkList.bookmarks.forEach((bookmark) => {
            window.open(bookmark.url, "_blank");
        });
    };

    const addBookmarkToList = (id: string, title: string, url: string) => {
        const bookmarkId = generateUUID();
        setBookmarks((prev) => {
            return prev.map((bookmark) => {
                if (bookmark.id === id) {
                    return {
                        ...bookmark,
                        bookmarks: [
                            ...bookmark.bookmarks,
                            { id: bookmarkId, title, url },
                        ],
                    };
                }
                return bookmark;
            });
        });
    };

    const removeBookmarkFromList = (id: string, bookmarkId: string) => {
        setBookmarks((prev) => {
            return prev.map((bookmark) => {
                if (bookmark.id === id) {
                    return {
                        ...bookmark,
                        bookmarks: bookmark.bookmarks.filter(
                            (bookmark) => bookmark.id !== bookmarkId
                        ),
                    };
                }
                return bookmark;
            });
        });
    };

    return (
        <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            style={modalCustomStyles}
            contentLabel="Example Modal"
        >
            <div className="row">
                <div className="col">
                    <h2>Add Bookmark</h2>
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <button
                        type="button"
                        className="btn btn-primary w-100"
                        onClick={() => addBookmarkList("Test", [])}
                    >
                        Add Bookmark List
                    </button>
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <button
                        type="button"
                        className="btn btn-primary w-100"
                        onClick={() =>
                            addBookmarkToList(
                                bookmarks[0].id,
                                "Test",
                                "https://google.com"
                            )
                        }
                    >
                        Add Bookmark to List
                    </button>
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <button
                        type="button"
                        className="btn btn-primary w-100"
                        onClick={() =>
                            removeBookmarkFromList(
                                bookmarks[0].id,
                                bookmarks[0].bookmarks[0].id
                            )
                        }
                    >
                        Remove Bookmark from List
                    </button>
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <button
                        type="button"
                        className="btn btn-primary w-100"
                        onClick={() => removeBookmarkList(bookmarks[0].id)}
                    >
                        Remove Bookmark List
                    </button>
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <button
                        type="button"
                        className="btn btn-primary w-100"
                        onClick={() => openBookmarkList(bookmarks[0].id)}
                    >
                        Open Bookmark List
                    </button>
                </div>
            </div>
            <div className="row mt-5 mb-5">
                <div className="col">
                    <button
                        type="button"
                        className="btn btn-primary w-100"
                        onClick={closeModal}
                    >
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
};

Modal.setAppElement("#root");

function generateUUID() {
    // Public Domain/MIT
    var d = new Date().getTime(); //Timestamp
    var d2 =
        (typeof performance !== "undefined" &&
            performance.now &&
            performance.now() * 1000) ||
        0; //Time in microseconds since page-load or 0 if unsupported
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
            var r = Math.random() * 16; //random number between 0 and 16
            if (d > 0) {
                //Use timestamp until depleted
                r = (d + r) % 16 | 0;
                d = Math.floor(d / 16);
            } else {
                //Use microseconds since page-load if supported
                r = (d2 + r) % 16 | 0;
                d2 = Math.floor(d2 / 16);
            }
            return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
        }
    );
}

function App() {
    const [bookmarks, setBookmarks] = useState<BookmarkListType[]>([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [modalMode, setModalMode] = useState<ModalMode>(DefaultModalMode);

    return (
        <>
            <ModalComponent modalIsOpen={modalIsOpen} modalMode={modalMode} closeModal={() => setModalIsOpen(false)} />
            <div className="container">
                <div className="row mt-5 mb-5">
                    <div className="col">
                        <button
                            type="button"
                            className="btn btn-primary w-100"
                            onClick={() => setModalIsOpen(true)}
                        >
                            + Add Bookmark
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default App;

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
    const [modalIsOpen, setIsOpen] = useState(false);
    const [bookmarks, setBookmarks] = useState<BookmarkListType[]>([]);

    const openModal = () => {
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
    };

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
        <>
        
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                style={modalCustomStyles}
                contentLabel="Example Modal"
            >
               

                
            </Modal>
            <div className="container">
                <div className="row mt-5 mb-5">
                    <div className="col">
                        <button
                            type="button"
                            className="btn btn-primary w-100"
                            onClick={openModal}
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

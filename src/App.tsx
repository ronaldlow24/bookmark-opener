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

const generateUUID = () => {
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
    isModalOpen: boolean;
    modalMode: ModalMode;
    closeModal: () => void;
    bookmarkList?: BookmarkListType;
    createOrUpdateBookmarkList: (bookmarkList: BookmarkListType) => void;
};

const ModalAddMode = "ADD";
const ModalEditMode = "EDIT";
const DefaultModalMode = ModalAddMode;
type ModalMode = typeof ModalAddMode | typeof ModalEditMode;

const ModalComponent: React.FC<ModalComponentType> = ({
    isModalOpen,
    modalMode,
    closeModal,
    bookmarkList,
    createOrUpdateBookmarkList,
}) => {
    const bookmarkListId = bookmarkList?.id ?? generateUUID();
    const [bookmarkListTitle, setTitle] = useState<string>(
        bookmarkList?.title ?? ""
    );
    const [bookmarkState, setBookmarkState] = useState<BookmarkType[]>(
        bookmarkList?.bookmarks ?? []
    );

    const [bookmarkTitle, setBookmarkTitle] = useState<string>("");
    const [bookmarkUrl, setBookmarkUrl] = useState<string>("");

    const handleCreateOrUpdateBookmarkList = () => {
        const newBookmarkList: BookmarkListType = {
            id: bookmarkListId,
            title: bookmarkListTitle,
            bookmarks: bookmarkState,
        };
        createOrUpdateBookmarkList(newBookmarkList);
    };

    const removeBookmarkFromList = (bookmarkId: string) => {
        setBookmarkState((prev) => {
            return prev.filter((bookmark) => bookmark.id !== bookmarkId);
        });
    };

    return (
        <Modal
            isOpen={isModalOpen}
            onRequestClose={closeModal}
            style={modalCustomStyles}
            contentLabel="Example Modal"
        >
            <div className="row">
                <div className="col">
                    <h2>
                        {modalMode == ModalAddMode ? "Add" : "Edit"} Bookmark
                        List
                    </h2>
                </div>
            </div>

            <div className="row mt-3">
                <div className="col">
                    <div className="input-group">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Bookmark List Title"
                            value={bookmarkListTitle}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {bookmarkState.map((bookmark) => {
                return (
                    <div className="row mt-3" key={bookmark.id}>
                        <div className="col">
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Bookmark Title"
                                    value={bookmark.title}
                                    onChange={(e) => {
                                        const newBookmarkState =
                                            bookmarkState.map((bookmark) => {
                                                if (
                                                    bookmark.id ===
                                                    bookmarkListId
                                                ) {
                                                    bookmark.title =
                                                        e.target.value;
                                                }
                                                return bookmark;
                                            });
                                        setBookmarkState(newBookmarkState);
                                    }}
                                />
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Bookmark URL"
                                    value={bookmark.url}
                                    onChange={(e) => {
                                        const newBookmarkState =
                                            bookmarkState.map((bookmark) => {
                                                if (
                                                    bookmark.id ===
                                                    bookmarkListId
                                                ) {
                                                    bookmark.url =
                                                        e.target.value;
                                                }
                                                return bookmark;
                                            });
                                        setBookmarkState(newBookmarkState);
                                    }}
                                />
                                <div className="input-group-append">
                                    <button
                                        className="btn btn-outline-secondary"
                                        type="button"
                                        onClick={() =>
                                            removeBookmarkFromList(bookmark.id)
                                        }
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}

            <div className="row mt-3">
                <div className="col">
                    <div className="input-group">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Bookmark Title"
                            value={bookmarkTitle}
                            onChange={(e) => setBookmarkTitle(e.target.value)}
                        />
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Bookmark URL"
                            value={bookmarkUrl}
                            onChange={(e) => setBookmarkUrl(e.target.value)}
                        />
                        <div className="input-group-append">
                            <button
                                className="btn btn-outline-secondary"
                                type="button"
                                onClick={() => {
                                    setBookmarkState((prev) => {
                                        return [
                                            ...prev,
                                            {
                                                id: generateUUID(),
                                                title: bookmarkTitle,
                                                url: bookmarkUrl,
                                            },
                                        ];
                                    });
                                    setBookmarkTitle("");
                                    setBookmarkUrl("");
                                }}
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col">
                    <button
                        type="button"
                        className="btn btn-primary w-100"
                        onClick={() => handleCreateOrUpdateBookmarkList()}
                    >
                        Save Change
                    </button>
                </div>
            </div>

            <div className="row mt-5 mb-5">
                <div className="col">
                    <button
                        type="button"
                        className="btn btn-primary w-100"
                        onClick={() => closeModal()}
                    >
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
};

Modal.setAppElement("#root");

function App() {
    const [bookmarkLists, setBookmarksList] = useState<BookmarkListType[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<ModalMode>(ModalAddMode);

    const openModal = (mode: ModalMode) => {
        setModalOpen(true);
        setModalMode(mode);
    };

    const closeModal = () => {
        setModalOpen(false);
        setModalMode(DefaultModalMode);
    };

    const openBookmarkListBookmarkInNewTab = (bookmarkListId: string) => {
        const bookmarkList = bookmarkLists.find(
            (bookmarkList) => bookmarkList.id === bookmarkListId
        );
        if (bookmarkList) {
            bookmarkList.bookmarks.forEach((bookmark) => {
                window.open(bookmark.url, "_blank");
            });
        }
    };

    const createOrUpdateBookmarkList = (model: BookmarkListType) => {
        if (model.id) {
            setBookmarksList((prev) => {
                return prev.map((bookmark) => {
                    if (bookmark.id === model.id) {
                        return model;
                    }
                    return bookmark;
                });
            });
        } else {
            const newId = generateUUID();
            setBookmarksList((prev) => [
                ...prev,
                {
                    id: newId,
                    title: model.title,
                    bookmarks: model.bookmarks,
                },
            ]);
        }
    };

    const removeBookmarkList = (id: string) => {
        setBookmarksList((prev) =>
            prev.filter((bookmark) => bookmark.id !== id)
        );
    };

    return (
        <>
            <ModalComponent
                isModalOpen={modalOpen}
                modalMode={modalMode}
                closeModal={() => closeModal()}
                createOrUpdateBookmarkList={createOrUpdateBookmarkList}
            />
            <div className="container">
                <div className="row mt-5 mb-5">
                    <div className="col">
                        <button
                            type="button"
                            className="btn btn-primary w-100"
                            onClick={() => openModal(ModalAddMode)}
                        >
                            + Add Bookmark
                        </button>
                    </div>
                </div>

                {bookmarkLists.map((bookmark) => {
                    return (
                        <div className="row mt-3" key={bookmark.id}>
                            <div className="col">
                                <div className="card">
                                    <div className="card-body">
                                        <h5 className="card-title">
                                            {bookmark.title}
                                        </h5>
                                        <div className="row">
                                            {bookmark.bookmarks.map(
                                                (bookmark) => {
                                                    return (
                                                        <div
                                                            className="col-6"
                                                            key={bookmark.id}
                                                        >
                                                            <a
                                                                href={
                                                                    bookmark.url
                                                                }
                                                            >
                                                                Open Link
                                                            </a>
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                        <div className="row mt-3">
                                            <div className="col">
                                                <button
                                                    type="button"
                                                    className="btn btn-primary w-100"
                                                    onClick={() =>
                                                        openBookmarkListBookmarkInNewTab(
                                                            bookmark.id
                                                        )
                                                    }
                                                >
                                                    Open All
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary w-100"
                                                    onClick={() =>
                                                        openModal(ModalEditMode)
                                                    }
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-danger w-100 mt-3"
                                                    onClick={() =>
                                                        removeBookmarkList(
                                                            bookmark.id
                                                        )
                                                    }
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}

export default App;

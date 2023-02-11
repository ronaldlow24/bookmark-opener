import { useEffect, useState } from "react";
import Modal from "react-modal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import setupIndexedDB, { useIndexedDBStore } from "use-indexeddb";

const BookmarkListTableName = "BookmarkList";
const BookmarkTableName = "Bookmark";

const idbConfig = {
    databaseName: "bookmark-db",
    version: 1,
    stores: [
        {
            name: BookmarkListTableName,
            id: { keyPath: "id" },
            indices: [{ name: "title", keyPath: "title" }],
        },
        {
            name: BookmarkTableName,
            id: { keyPath: "id" },
            indices: [
                { name: "title", keyPath: "title" },
                { name: "url", keyPath: "url" },
                { name: "bookmarkListId", keyPath: "bookmarkListId" },
            ],
        },
    ],
};

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

//validate url using regex for http and https
const validateUrl = (url: string) => {
    const urlRegex =
        /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;
    return urlRegex.test(url);
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
    id?: string;
    title: string;
    bookmarks: BookmarkType[];
};

type BookmarkType = {
    id?: string;
    title: string;
    url: string;
    bookmarkListId?: string;
};

type ModalComponentType = {
    modelStatus: ModalStatusType;
    closeModal: () => void;
    createOrUpdateBookmarkList: (
        bookmarkList: BookmarkListType
    ) => Promise<boolean>;
};

type ModalStatusType = {
    isModalOpen: boolean;
    modalMode: ModalMode;
    bookmarkList?: BookmarkListType;
};

const ModalAddMode = "ADD";
const ModalEditMode = "EDIT";
const DefaultModalMode = ModalAddMode;
type ModalMode = typeof ModalAddMode | typeof ModalEditMode;

const ModalComponent: React.FC<ModalComponentType> = ({
    modelStatus,
    closeModal,
    createOrUpdateBookmarkList,
}) => {
    const [bookmarkListTitle, setTitle] = useState<string>("");
    const [bookmarkState, setBookmarkState] = useState<BookmarkType[]>([]);
    const [bookmarkTitle, setBookmarkTitle] = useState<string>("");
    const [bookmarkUrl, setBookmarkUrl] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        if (modelStatus.isModalOpen) {
            setTitle(modelStatus.bookmarkList?.title || "");
            setBookmarkState(modelStatus.bookmarkList?.bookmarks || []);
        }
    }, [modelStatus.isModalOpen, modelStatus.bookmarkList]);

    const handleCreateOrUpdateBookmarkList = async () => {
        setIsLoading(true);
        const newBookmarkList: BookmarkListType = {
            id: modelStatus.bookmarkList?.id,
            title: bookmarkListTitle,
            bookmarks: bookmarkState,
        };
        const result = await createOrUpdateBookmarkList(newBookmarkList);
        setIsLoading(false);
        if (result) clearAndCloseModal();
    };

    const clearAndCloseModal = () => {
        setTitle("");
        setBookmarkState([]);
        setBookmarkTitle("");
        setBookmarkUrl("");
        closeModal();
    };

    return (
        <Modal
            isOpen={modelStatus.isModalOpen}
            onRequestClose={clearAndCloseModal}
            style={modalCustomStyles}
            contentLabel="Example Modal"
        >
            <div className="row">
                <div className="col">
                    <h2>
                        {modelStatus.modalMode == ModalAddMode ? "Add" : "Edit"} Bookmark
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
                                            bookmarkState.map((item) => {
                                                if (item.id === bookmark.id) {
                                                    item.title = e.target.value;
                                                }
                                                return item;
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
                                            bookmarkState.map((item) => {
                                                if (item.id === bookmark.id) {
                                                    item.url = e.target.value;
                                                }
                                                return item;
                                            });
                                        setBookmarkState(newBookmarkState);
                                    }}
                                />
                                <div className="input-group-append">
                                    <button
                                        disabled={isLoading}
                                        className="btn btn-danger"
                                        type="button"
                                        onClick={() =>
                                            setBookmarkState(
                                                bookmarkState.filter(
                                                    (item) =>
                                                        item.id !== bookmark.id
                                                )
                                            )
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
                                disabled={isLoading}
                                className="btn btn-success"
                                type="button"
                                onClick={() => {
                                    //validation
                                    if (bookmarkTitle === "") {
                                        toast.error(
                                            "Bookmark Title Is Missing!",
                                            {
                                                position: "top-right",
                                                autoClose: 1500,
                                                hideProgressBar: false,
                                                closeOnClick: true,
                                                pauseOnHover: true,
                                                draggable: true,
                                                progress: undefined,
                                                theme: "colored",
                                            }
                                        );
                                        return;
                                    }
                                    if (bookmarkUrl === "") {
                                        toast.error(
                                            "Bookmark URL Is missing!",
                                            {
                                                position: "top-right",
                                                autoClose: 1500,
                                                hideProgressBar: false,
                                                closeOnClick: true,
                                                pauseOnHover: true,
                                                draggable: true,
                                                progress: undefined,
                                                theme: "colored",
                                            }
                                        );
                                        return;
                                    }
                                    if (!validateUrl(bookmarkUrl)) {
                                        toast.error(
                                            "Bookmark URL Is Invalid!",
                                            {
                                                position: "top-right",
                                                autoClose: 1500,
                                                hideProgressBar: false,
                                                closeOnClick: true,
                                                pauseOnHover: true,
                                                draggable: true,
                                                progress: undefined,
                                                theme: "colored",
                                            }
                                        );
                                        return;
                                    }
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

            <div className="row mt-5 mb-1">
                <div className="col">
                    <button
                        disabled={isLoading}
                        type="button"
                        className="btn btn-success w-100"
                        onClick={async () =>
                            await handleCreateOrUpdateBookmarkList()
                        }
                    >
                        Save Change
                    </button>
                </div>
            </div>

            <div className="row mt-1 mb-1">
                <div className="col">
                    <button
                        disabled={isLoading}
                        type="button"
                        className="btn btn-primary w-100"
                        onClick={() => clearAndCloseModal()}
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
    const [modalStatus, setModalStatus] = useState<ModalStatusType>({
        isModalOpen: false,
        modalMode: DefaultModalMode,
    });
    const [searchText, setSearchText] = useState<string>("");

    const renderedBookmarkLists = bookmarkLists.filter((bookmarkList) => {
        //get bookmark list title and bookmarks title
        return (
            bookmarkList.title
                .toLowerCase()
                .trim()
                .includes(searchText.toLowerCase().trim()) ||
            bookmarkList.bookmarks.find((bookmark) => {
                return bookmark.title
                    .toLowerCase()
                    .trim()
                    .includes(searchText.toLowerCase().trim());
            })
        );
    });

    useEffect(() => {
        console.log("useEffect for setup indexedDB");

        setupIndexedDB(idbConfig)
            .then(() => console.log("success"))
            .catch((e) => console.error("error / unsupported", e));
    }, []);

    const BookmarkListIndexedDBStore = useIndexedDBStore(BookmarkListTableName);
    const BookmarkIndexedDBStore = useIndexedDBStore(BookmarkTableName);
    const dbConfig = {
        BookmarkList: BookmarkListIndexedDBStore,
        Bookmark: BookmarkIndexedDBStore,
    };

    useEffect(() => {
        console.log("useEffect for getting bookmark list from indexedDB");

        if (dbConfig == undefined) return;

        let ignore = false;

        async function startFetching() {
            const bookmarkLists =
                (await dbConfig.BookmarkList.getAll()) as BookmarkListType[];
            const bookmarks =
                (await dbConfig.Bookmark.getAll()) as BookmarkType[];

            const bookmarkListsWithBookmarks = bookmarkLists.map(
                (bookmarkList) => {
                    bookmarkList.bookmarks = bookmarks.filter((bookmark) => {
                        return bookmark.bookmarkListId === bookmarkList.id;
                    });
                    return bookmarkList;
                }
            );
            if (!ignore) setBookmarksList(bookmarkListsWithBookmarks);
        }

        startFetching();

        return () => {
            ignore = true;
        };
    }, []);

    const openNewModal = () => {
        setModalStatus({ isModalOpen: true, modalMode: ModalAddMode });
    };

    const openExistingModal = (bookmarkListId: string) => {
        const bookmarkList = bookmarkLists.find(
            (bookmarkList) => bookmarkList.id === bookmarkListId
        );

        setModalStatus({ isModalOpen: true, modalMode: ModalEditMode, bookmarkList: bookmarkList });
    };

    const closeModal = () => {
        setModalStatus({ isModalOpen: false, modalMode: DefaultModalMode });
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

    const DeleteBookmarkListInDatabaseAsync = async (
        bookmarkListId: string
    ) => {
        console.log("delete bookmark list in database async");
        const bookmarkList = bookmarkLists.find(
            (bookmarkList) => bookmarkList.id === bookmarkListId
        );
        if (bookmarkList) {
            await dbConfig.BookmarkList.deleteByID(bookmarkListId);
            const bookmarkIds = bookmarkList.bookmarks.map(
                (bookmark) => bookmark.id
            );
            //delete bookmarks by loop
            bookmarkIds.forEach(async (bookmarkId) => {
                await dbConfig.Bookmark.deleteByID(bookmarkId);
            });
        }
    };

    const UpdateOrInsertBookmarkListInDatabaseAsync = async (
        model: BookmarkListType
    ) => {
        const bookmarkListInDatabase = await dbConfig.BookmarkList.getByID(
            model.id!
        );
        if (bookmarkListInDatabase) {
            await dbConfig.BookmarkList.deleteByID(model.id!);
        }

        const bookmarkIds = model.bookmarks.map((bookmark) => bookmark.id);
        //delete bookmarks by loop
        bookmarkIds.forEach(async (bookmarkId) => {
            await dbConfig.Bookmark.deleteByID(bookmarkId);
        });

        await dbConfig.BookmarkList.add(model);
        model.bookmarks.forEach(async (bookmark) => {
            await dbConfig.Bookmark.add(bookmark);
        });
    };

    const createOrUpdateBookmarkList = async (model: BookmarkListType) => {
        //validate bookmark list title
        if (!model.title || model.title.trim() === "") {
            toast.error("Bookmark List Title Is Missing!", {
                position: "top-right",
                autoClose: 1500,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });
            return false;
        }

        //validate bookmark list bookmarks
        if (!model.bookmarks || model.bookmarks.length === 0) {
            toast.error("Bookmarks Is Missing!", {
                position: "top-right",
                autoClose: 1500,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });
            return false;
        }

        //validate bookmark list bookmarks title is not empty
        const bookmarkListBookmarksTitleIsEmpty = model.bookmarks.find(
            (bookmark) => {
                return !bookmark.title || bookmark.title.trim() === "";
            }
        );
        if (bookmarkListBookmarksTitleIsEmpty) {
            toast.error("Bookmark List Bookmarks Title Is Missing!", {
                position: "top-right",
                autoClose: 1500,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });
            return false;
        }

        //validate bookmark list bookmarks url is not empty
        const bookmarkListBookmarksUrlIsEmpty = model.bookmarks.find(
            (bookmark) => {
                return !bookmark.url || bookmark.url.trim() === "";
            }
        );
        if (bookmarkListBookmarksUrlIsEmpty) {
            toast.error("Bookmark List Bookmarks URL Is Missing!", {
                position: "top-right",
                autoClose: 1500,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });
            return false;
        }

        //validate bookmark list bookmarks url is valid
        const bookmarkListBookmarksUrlIsInvalid = model.bookmarks.find(
            (bookmark) => {
                return !validateUrl(bookmark.url);
            }
        );
        if (bookmarkListBookmarksUrlIsInvalid) {
            toast.error("Bookmark List Bookmarks URL Is Invalid!", {
                position: "top-right",
                autoClose: 1500,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });
            return false;
        }

        let IsNew = true;

        if (!model.id) model.id = generateUUID();
        else IsNew = false;

        model.bookmarks.forEach((bookmark) => {
            bookmark.bookmarkListId = model.id;
        });

        //remove bookmark list from state and add it again
        setBookmarksList((prev) => {
            return prev.filter((bookmarkList) => {
                return bookmarkList.id !== model.id;
            });
        });

        setBookmarksList((prev) => {
            return [...prev, model];
        });

        await UpdateOrInsertBookmarkListInDatabaseAsync(model);

        return true;
    };

    const removeBookmarkList = async (id: string) => {
        setBookmarksList((prev) => {
            return prev.filter((bookmark) => bookmark.id !== id);
        });

        await DeleteBookmarkListInDatabaseAsync(id);
    };

    return (
        <>
            <ToastContainer />
            <ModalComponent
                modelStatus={modalStatus}
                closeModal={closeModal}
                createOrUpdateBookmarkList={createOrUpdateBookmarkList}
            />
            <div className="container">
                <div className="row mt-5 mb-3">
                    <div className="col">
                        <button
                            type="button"
                            className="btn btn-primary w-100"
                            onClick={() => openNewModal()}
                        >
                            + Add Bookmark
                        </button>
                    </div>
                </div>
                <div className="row mt-5 mb-5">
                    <div className="col">
                        <h5>Search</h5>
                        <input
                            type="search"
                            className="form-control"
                            onChange={(e) => setSearchText(e.target.value)}
                            placeholder="Search bookmark list or title"
                        />
                    </div>
                </div>

                {renderedBookmarkLists.length === 0 ? (
                    <div className="row mt-5">
                        <div className="col">
                            <h3 className="text-center">
                                No Bookmark List Found!
                            </h3>
                        </div>
                    </div>
                ) : (
                    renderedBookmarkLists.map((bookmarkList) => {
                        return (
                            <div className="row mt-3" key={bookmarkList.id}>
                                <div className="col">
                                    <div className="card">
                                        <div className="card-body">
                                            <h5 className="card-title">
                                                {bookmarkList.title}
                                            </h5>
                                            <div className="row">
                                                {bookmarkList.bookmarks.map(
                                                    (bookmark) => {
                                                        return (
                                                            <div
                                                                className="col"
                                                                key={
                                                                    bookmark.id
                                                                }
                                                            >
                                                                <div className="card">
                                                                    <div className="card-body">
                                                                        <h5 className="card-title">
                                                                            {
                                                                                bookmark.title
                                                                            }
                                                                        </h5>
                                                                        <a
                                                                            className="card-text"
                                                                            href={
                                                                                bookmark.url
                                                                            }
                                                                            target="_blank"
                                                                        >
                                                                            {
                                                                                bookmark.url
                                                                            }
                                                                        </a>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                )}
                                            </div>
                                            <div className="row mt-3">
                                                <div className="col-4">
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary w-100"
                                                        onClick={() =>
                                                            openBookmarkListBookmarkInNewTab(
                                                                bookmarkList.id!
                                                            )
                                                        }
                                                    >
                                                        Open All
                                                    </button>
                                                </div>
                                                <div className="col-4">
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary w-100"
                                                        onClick={() =>
                                                            openExistingModal(
                                                                bookmarkList.id!
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </button>
                                                </div>
                                                <div className="col-4">
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger w-100"
                                                        onClick={async () =>
                                                            await removeBookmarkList(
                                                                bookmarkList.id!
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
                    })
                )}

                <div className="row mt-5 mb-3">
                    <br></br>
                </div>
            </div>
        </>
    );
}

export default App;

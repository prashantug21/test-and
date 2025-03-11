'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Modal, Select } from 'antd';

const ModalWrapper = ({ open, setOpen }) => {
    const [loading, setLoading] = useState(false);
    const [memes, setMemes] = useState([]);

    // Fetch memes when modal opens
    useEffect(() => {
        if (open) {
            axios.get("https://api.imgflip.com/get_memes")
                .then((response) => {
                    if (response.data.success) {
                        setMemes(response.data.data.memes);
                    }
                })
                .catch((error) => console.error("Error fetching memes:", error));
        }
    }, [open]);

    const handleOk = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setOpen(false);
        }, 3000);
    };

    const handleCancel = () => {
        setOpen(false);
    };

    return (
        <>
            <Modal
                open={open}
                title="Select a Meme"
                onOk={handleOk}
                onCancel={handleCancel}
                footer={[
                    <Button key="back" onClick={handleCancel}>
                        Return
                    </Button>,
                    <Button key="submit" type="primary" loading={loading} onClick={handleOk}>
                        Submit
                    </Button>,
                ]}
            >
                <Select
                    style={{ width: "100%" }}
                    placeholder="Choose a meme"
                    options={memes.map((meme) => ({
                        value: meme.id,
                        label: meme.name
                    }))}
                />
            </Modal>
        </>
    );
};

export default ModalWrapper;

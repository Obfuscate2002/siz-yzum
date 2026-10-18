import {
    Button,
    Drawer,
    type DrawerProps,
    Flex,
    type GetProp,
} from "antd";
import {createStaticStyles} from "antd-style";
import type {IssuanceNormHeaderExpanded} from "../../types/norms.ts";
import {IssuanceNormTabs} from "./IssuanceNormTabs.tsx";


const sharedContent = (issuanceNorm: IssuanceNormHeaderExpanded | undefined) => {

    return (
        <>
            <IssuanceNormTabs issuanceNorm={issuanceNorm}/>
        </>
    );
}

const classNames = createStaticStyles(
    ({ css }): NonNullable<GetProp<DrawerProps, 'classNames', 'Return'>> => ({
        root: css`
      border-radius: 10px;
      padding: 10px;
    `,
    }),
);


const stylesFn: DrawerProps['styles'] = (info): GetProp<DrawerProps, 'styles', 'Return'> => {
    if (info.props.footer) {
        return {
            header: {
                padding: 16,
            },
            body: {
                padding: 16,
            },
            footer: {
                padding: '16px 10px',
                backgroundColor: '#fafafa',
            },
        };
    }
};

type SelectProp = {
    selectedIssuanceNormId: string | null;
    onClose: () => void;
    issuanceNorm: IssuanceNormHeaderExpanded | undefined;
}


export const IssuanceNormRecord = ({selectedIssuanceNormId, onClose, issuanceNorm}: SelectProp) => {
    const sharedProps: DrawerProps = {
        classNames,
        size: 800,
    };

    const footer: React.ReactNode = (
        <Flex gap="medium" justify="flex-end">
            <Button
                styles={{ root: { borderColor: '#ccc', color: '#171717', backgroundColor: '#fff' } }}
                onClick={onClose}
            >
                Отмена
            </Button>
            <Button
                type="primary"
                styles={{ root: { backgroundColor: '#171717' } }}
            >
                Сохранить
            </Button>
        </Flex>
    );

    return (
        <Drawer
            {...sharedProps}
            footer={footer}
            title={issuanceNorm?.expand?.position?.name ?? "Карточка нормы"}
            styles={stylesFn}
            mask={{ enabled: true, blur: true }}
            open={selectedIssuanceNormId !== null}
            onClose={onClose}
            closable={false}
        >
            {sharedContent(issuanceNorm)}
        </Drawer>
    )
}
import fetch from 'node-fetch';
import { load } from 'cheerio';

async function getRawProbData(url) {
    const $ = load(await (await fetch(url)).text());
    return $('.contents_wrap .my_page_tb2 tr > td').filter((_, v) => !$(v).attr('rowspan'));
}

export class MapleProb extends null {
    static GOLDAPPLE_PROBTABLE = {};
    static LUNACRYSTAL_PROBTABLE = {
        스윗: {},
        드림: {}
    };
    static ROYALFACE_PROBTABLE = {
        남: [],
        여: []
    }; // 성형은 모두 동일 확률이므로 배열을 이용
    static ROYALHAIR_PROBTABLE = {
        남: [],
        여: []
    }; // 헤어는 모두 동일 확률이므로 배열을 이용
    static ROYALSTYLE_PROBTABLE = {};
    static WONDERBERRY_PROBTABLE = {};

    static async fetchAllProb() {
        try {
            await Promise.all([
                MapleProb.fetchGoldApple(),
                MapleProb.fetchLunaCrystal(),
                MapleProb.fetchRoyalFace(),
                MapleProb.fetchRoyalHair(),
                MapleProb.fetchRoyalStyle(),
                MapleProb.fetchWonderBerry()
            ]);
            setTimeout(MapleProb.fetchAllProb, 120 * 60 * 1000);
        } catch {}
    }

    static async fetchGoldApple() {
        // 골드애플 파싱
        const appleData = await getRawProbData('https://maplestory.nexon.com/Guide/CashShop/Probability/GoldApple');

        MapleProb.GOLDAPPLE_PROBTABLE = {};
        for (let i = 0; i < appleData.length; i += 2) {
            const prob = +appleData
                .eq(i + 1)
                .text()
                .replace(/\D+/g, '');
            MapleProb.GOLDAPPLE_PROBTABLE[appleData.eq(i).text()] = prob;
        }
    }

    static async fetchLunaCrystal() {
        // 루나크리스탈 파싱
        const sweetData = await getRawProbData(
            'https://maplestory.nexon.com/Guide/CashShop/Probability/LunaCrystalSweet'
        );

        MapleProb.LUNACRYSTAL_PROBTABLE['스윗'] = {};
        for (let i = 0; i < sweetData.length; i += 2) {
            const prob = +sweetData
                .eq(i + 1)
                .text()
                .replace(/\D+/g, '');
            MapleProb.LUNACRYSTAL_PROBTABLE['스윗'][sweetData.eq(i).text()] = prob;
        }

        const dreamData = await getRawProbData(
            'https://maplestory.nexon.com/Guide/CashShop/Probability/LunaCrystalDream'
        );

        MapleProb.LUNACRYSTAL_PROBTABLE['드림'] = {};
        for (let i = 0; i < dreamData.length; i += 2) {
            const prob = +dreamData
                .eq(i + 1)
                .text()
                .replace(/\D+/g, '');
            MapleProb.LUNACRYSTAL_PROBTABLE['드림'][dreamData.eq(i).text()] = prob;
        }
    }

    static async fetchRoyalFace() {
        // 로얄 성형 파싱
        const faceData = await getRawProbData(
            'https://maplestory.nexon.com/Guide/CashShop/Probability/RoyalPlasticSurgeryCoupon'
        );

        MapleProb.ROYALFACE_PROBTABLE['남'] = [];
        for (let i = 0; i < faceData.length / 2; i += 2) {
            MapleProb.ROYALFACE_PROBTABLE['남'].push(faceData.eq(i).text());
        }
        MapleProb.ROYALFACE_PROBTABLE['여'] = [];
        for (let i = faceData.length / 2; i < faceData.length; i += 2) {
            MapleProb.ROYALFACE_PROBTABLE['여'].push(faceData.eq(i).text());
        }
    }

    static async fetchRoyalHair() {
        // 로얄 헤어 파싱
        const hairData = await getRawProbData(
            'https://maplestory.nexon.com/Guide/CashShop/Probability/RoyalHairCoupon'
        );

        MapleProb.ROYALHAIR_PROBTABLE['남'] = [];
        for (let i = 0; i < hairData.length / 2; i += 2) {
            MapleProb.ROYALHAIR_PROBTABLE['남'].push(hairData.eq(i).text());
        }
        MapleProb.ROYALHAIR_PROBTABLE['여'] = [];
        for (let i = hairData.length / 2; i < hairData.length; i += 2) {
            MapleProb.ROYALHAIR_PROBTABLE['여'].push(hairData.eq(i).text());
        }
    }

    static async fetchRoyalStyle() {
        // 로얄스타일 파싱
        const royalData = await getRawProbData('https://maplestory.nexon.com/Guide/CashShop/Probability/RoyalStyle');

        MapleProb.ROYALSTYLE_PROBTABLE = {};
        for (let i = 0; i < royalData.length; i += 2) {
            const prob = +royalData
                .eq(i + 1)
                .text()
                .replace(/\D+/g, '');
            MapleProb.ROYALSTYLE_PROBTABLE[royalData.eq(i).text()] = prob;
        }
    }

    static async fetchWonderBerry() {
        // 원더베리 파싱
        const wonderData = await getRawProbData(
            'https://maplestory.nexon.com/Guide/CashShop/Probability/WispsWonderBerry'
        );

        MapleProb.WONDERBERRY_PROBTABLE = {};
        for (let i = 0; i < wonderData.length; i += 2) {
            const prob = +wonderData
                .eq(i + 1)
                .text()
                .replace(/\D+/g, '');
            MapleProb.WONDERBERRY_PROBTABLE[wonderData.eq(i).text()] = prob;
        }
    }
}

MapleProb.fetchAllProb();

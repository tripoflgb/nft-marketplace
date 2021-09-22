import React, { useEffect, useState } from 'react';
// import Link from 'next/link';
import style from './NFT.module.scss';
import Footer from 'components/base/Footer';
import FloatingHeader from 'components/base/FloatingHeader';
import Media from 'components/base/Media';
import Scale from 'components/assets/scale';
import Share from 'components/assets/share';
import Like from 'components/assets/heart';
import Eye from 'components/assets/eye';
import { computeCaps, computeTiime } from 'utils/strings';
import { UserType, NftType } from 'interfaces';
import { likeNFT, unlikeNFT } from 'actions/user';
import ModalShare from 'components/base/ModalShare';
import NoNFTImage from '../../assets/NoNFTImage';
import Badge from 'components/assets/badge';
import Details from './Details';
import { MARKETPLACE_ID } from 'utils/constant';

export interface NFTPageProps {
  NFT: NftType;
  setNftToBuy: (NFT: NftType) => void;
  user: UserType;
  setUser: (u: UserType) => void;
  type: string | null;
  setExp: (n: number) => void;
  setNotAvailable: (b: boolean) => void;
  setModalExpand: (b: boolean) => void;
  capsValue: number;
}

const NFTPage: React.FC<NFTPageProps> = ({
  setExp,
  NFT,
  setNftToBuy,
  setModalExpand,
  setNotAvailable,
  user,
  setUser,
  type,
}) => {
  const [likeLoading, setLikeLoading] = useState(false);
  const [modalShareOpen, setModalShareOpen] = useState(false);
  const shareSubject = 'Check out this Secret NFT';
  const shareText = `Check out ${NFT.name ? NFT.name : "this nft"} on ${process.env.NEXT_PUBLIC_APP_LINK ? process.env.NEXT_PUBLIC_APP_LINK : "secret-nft.com"}`
  const shareUrl = (typeof window!=="undefined" && window.location?.href) || `https://www.${process.env.NEXT_PUBLIC_APP_LINK ? process.env.NEXT_PUBLIC_APP_LINK : "secret-nft.com"}/nft/${NFT.id}`
  const isLiked = !user
    ? undefined
    : NFT.serieId === '0'
    ? user.likedNFTs?.map((x) => x.nftId).includes(NFT.id)
    : user.likedNFTs?.map((x) => x.serieId).includes(NFT.serieId);
  const numberListedOnThisMarketplace = !NFT.serieData ? 0 : NFT.serieData.reduce((prev, current) => prev + (current?.listed===1 && current.marketplaceId===MARKETPLACE_ID ? 1 : 0), 0)
  const smallestPriceRow = !NFT.serieData ? NFT : NFT.serieData.sort((a,b)=> b.listed - a.listed || Number(a.price) - Number(b.price) || Number(a.priceTiime) - Number(b.priceTiime))[0]
  const userCanBuyCaps = user
    ? user.capsAmount &&
      smallestPriceRow.price &&
      smallestPriceRow.price !== '' &&
      Number(user.capsAmount) >= Number(smallestPriceRow.price)
    : true;
  //const userCanBuyTiime = user ? user.tiimeAmount && smallestPriceRow.priceTiime && smallestPriceRow.priceTiime !== "" && (Number(smallestPriceRow.tiimeAmount) >= Number(smallestPriceRow.priceTiime)) : true
  const userCanBuy = userCanBuyCaps && user.walletId !== smallestPriceRow.owner; // || userCanBuyTiime

  useEffect(()=>{
    setNftToBuy(smallestPriceRow)
  }, [smallestPriceRow])

  const handleLikeDislike = async () => {
    try {
      let res = null;
      if (!likeLoading && user) {
        setLikeLoading(true);
        if (!isLiked) {
          res = await likeNFT(user.walletId, NFT.id);
        } else {
          res = await unlikeNFT(user.walletId, NFT.id);
        }
      }
      if (res !== null) setUser({ ...user, ...res });
      setLikeLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = async () => {
    try {
      // TODO : Make share with native
      // if (window && window.isRNApp && navigator){
      //   await navigator.share({
      //     title: shareSubject,
      //     text: shareText,
      //     url: shareUrl
      //   })
      // }else{
      //   setModalShareOpen(true)
      // }
      setModalShareOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={style.Container}>
      <div className={style.MainWrapper}>
        <div className={style.Wrapper}>
          <div className={style.NFT}>
            <Media
              src={NFT.media.url}
              type={type}
              alt="imgnft"
              draggable="false"
              className={style.NFTIMG}
            />
            <div onClick={() => setExp(1)} className={style.Scale}>
              <Scale className={style.ScaleSVG} />
            </div>
          </div>
          <div className={style.Text}>
            <div className={style.Top}>
              <div className={style.TopInfosCreator}>
                <div className={style.TopInfosCreatorPicture}>
                  <img
                    src={NFT.creatorData.picture}
                    className={style.TopInfosCreatorPictureIMG}
                  />
                  {NFT.creatorData.verified && (
                    <Badge className={style.TopInfosCreatorCertifiedBadge} />
                  )}
                </div>
                <div className={style.TopInfosCreatorName}>
                  {NFT.creatorData.name}
                </div>
              </div>
              <div className={style.TopInfos}>
                <div className={style.Views}>
                  <Eye className={style.EyeSVG} />
                  {NFT.viewsCount}
                </div>
                <div
                  className={`${style.Like} ${isLiked ? style.Liked : ''} ${
                    likeLoading || !user ? style.DisabledLike : ''
                  }`}
                  onClick={() => handleLikeDislike()}
                >
                  <Like className={style.LikeSVG} />
                </div>
                <div className={style.Share} onClick={() => handleShare()}>
                  <Share className={style.ShareSVG} />
                </div>
              </div>
            </div>
            <div className={style.Line} />
            <div className={style.Hide}>
              <div className={style.Tags}>
                <div className={style.Tag}>
                  <span role="img" className={style.Emoji} aria-label="art">
                    🎨
                  </span>
                  Design
                </div>
              </div>
            </div>
            <h1 className={style.Title}>{NFT.name}</h1>
            <p className={style.Description}>{NFT.description}</p>
            <div className={style.Buy}>
              <div
                onClick={() => smallestPriceRow.listed && userCanBuy && setNftToBuy(smallestPriceRow) && setExp(2)}
                className={
                  smallestPriceRow.listed && userCanBuy
                    ? style.Button
                    : `${style.Button} ${style.Disabled}`
                }
              >
                Buy for{' '}
                {smallestPriceRow && (
                  <>
                    {smallestPriceRow.price &&
                      Number(smallestPriceRow.price) > 0 &&
                      `${computeCaps(Number(smallestPriceRow.price))} CAPS`}
                    {smallestPriceRow.price &&
                      Number(smallestPriceRow.price) > 0 &&
                      smallestPriceRow.priceTiime &&
                      Number(smallestPriceRow.priceTiime) &&
                      ` / `}
                    {smallestPriceRow.priceTiime &&
                      Number(smallestPriceRow.priceTiime) > 0 &&
                      `${computeTiime(Number(smallestPriceRow.priceTiime))} TIIME`}
                  </>
                )}
              </div>
            </div>
            <div className={style.Available}>
              <div className={style.AvailbleText}>
                <NoNFTImage className={style.AvailbleCards} />
                {`${numberListedOnThisMarketplace} of ${NFT.serieData ? NFT.serieData.length : 0}`} Available
              </div>
              <div className={style.AvailableBackLine} />
            </div>
            {/* <div className={style.Buy}>
              <div className={style.BuyLeft}>
                <div className={style.QuantityLabel}>
                  {`Available : `}
                  <span className={style.QuantityCount}>
                    {typeof NFT.totalListedNft !== 'undefined'
                      ? NFT.totalListedNft
                      : 1}
                  </span>
                </div>
                <div
                  onClick={() => NFT.listed && userCanBuy && setExp(2)}
                  className={
                    NFT.listed && userCanBuy
                      ? style.Button
                      : `${style.Button} ${style.Disabled}`
                  }
                >
                  Buy
                </div>
              </div>
              {NFT.listed === 1 && (
                <div className={style.BuyRight}>
                  <div className={style.Price}>
                    {NFT.price &&
                      Number(NFT.price) > 0 &&
                      `${computeCaps(Number(NFT.price))} CAPS`}
                    {NFT.price &&
                      Number(NFT.price) > 0 &&
                      NFT.priceTiime &&
                      Number(NFT.priceTiime) &&
                      ` / `}
                    {NFT.priceTiime &&
                      Number(NFT.priceTiime) > 0 &&
                      `${computeTiime(Number(NFT.priceTiime))} TIIME`}
                  </div>
                  {fiatPrice > 0 && (
                    <span className={style.FiatPrice}>
                      {fiatPrice.toFixed(4)}$
                    </span>
                  )}
                </div>
              )}
            </div> */}
            {/* <div className={style.HistoryTop}>
            <div className={style.HistoryTitle}>History</div>
            <div className={style.HistoryLine} />
          </div>
            <div className={style.History}>
              
               <Link href={`/${NFT.ownerData.walletId}`}>
              <a className={style.HistoryItem}>
                <Check className={style.Check} />
                <div className={style.HistoryAvatar}>
                  {NFT.ownerData.picture ? (
                    <img
                      src={NFT.ownerData.picture}
                      className={style.HistoryIMG}
                    />
                  ) : (
                    <div className={style.HistoryIMG} style={bgGradientOwner} />
                  )}
                </div>
                <div className={style.HistoryUser}>
                  <div className={style.HistoryRole}>Owner</div>
                  <div className={style.HistoryName}>{NFT.ownerData.name}</div>
                </div>
              </a>
            </Link>

            <Link href={`/${NFT.creatorData.walletId}`}>
              <a className={style.HistoryItem}>
                <Check className={style.Check} />
                <div className={style.HistoryAvatar}>
                  {NFT.creatorData.picture ? (
                    <img
                      src={NFT.creatorData.picture}
                      className={style.HistoryIMG}
                    />
                  ) : (
                    <div
                      className={style.HistoryIMG}
                      style={bgGradientCreator}
                    />
                  )}
                </div>
                <div className={style.HistoryUser}>
                  <div className={style.HistoryRole}>Creator</div>
                  <div className={style.HistoryName}>
                    {NFT.creatorData.name}
                  </div>
                </div>
              </a>
            </Link> 
            </div>*/}
          </div>
        </div>
        <div>
          <Details NFT={NFT} user={user} setNftToBuy={setNftToBuy} setExp={setExp}/>
        </div>
      </div>
      <Footer setNotAvailable={setNotAvailable} />
      <FloatingHeader user={user} setModalExpand={setModalExpand} />
      {modalShareOpen && (
        <ModalShare
          setModalExpand={setModalShareOpen}
          title={'Share this NFT with your friends'}
          subject={shareSubject}
          text={shareText}
          url={shareUrl}
        />
      )}
    </div>
  );
};

export default NFTPage;
